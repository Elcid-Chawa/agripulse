import React, { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, FirebaseUser } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Calendar, 
  Clock, 
  X, 
  Loader2,
  Sprout
} from 'lucide-react';

interface TasksProps {
  user: FirebaseUser;
}

export default function Tasks({ user }: TasksProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tasksQuery = query(collection(db, 'tasks'), where('farmId', '==', user.uid));
    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        farmId: user.uid,
        title: newTask.title,
        description: newTask.description,
        status: 'pending',
        dueDate: newTask.dueDate || new Date().toISOString(),
        createdAt: serverTimestamp()
      });
      setNewTask({ title: '', description: '', dueDate: '' });
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
    setLoading(false);
  };

  const toggleTask = async (taskId: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: currentStatus === 'pending' ? 'completed' : 'pending'
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-emerald-900">Farm Tasks</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-6 rounded-3xl shadow-xl border border-emerald-100 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-emerald-900">New Activity</h3>
              <button onClick={() => setIsAdding(false)} className="text-emerald-400 hover:text-emerald-600"><X /></button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <input 
                type="text" 
                placeholder="Task Title (e.g., Watering Corn)"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full p-4 rounded-2xl bg-emerald-50 border-none focus:ring-2 focus:ring-emerald-500 text-emerald-900 font-medium"
                required
              />
              <textarea 
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full p-4 rounded-2xl bg-emerald-50 border-none focus:ring-2 focus:ring-emerald-500 text-emerald-900 font-medium min-h-[100px]"
              />
              <div className="flex items-center gap-2 bg-emerald-50 p-4 rounded-2xl">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <input 
                  type="date" 
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="bg-transparent border-none focus:ring-0 text-emerald-900 font-medium w-full"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Task'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {tasks.length > 0 ? tasks.map((task) => (
          <motion.div 
            layout
            key={task.id} 
            className={`bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 flex items-start gap-4 transition-all ${task.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}
          >
            <button 
              onClick={() => toggleTask(task.id, task.status)}
              className={`mt-1 transition-colors ${task.status === 'completed' ? 'text-emerald-600' : 'text-emerald-200 hover:text-emerald-400'}`}
            >
              {task.status === 'completed' ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
            </button>
            <div className="flex-1 min-w-0">
              <h4 className={`font-bold text-lg text-emerald-900 truncate ${task.status === 'completed' ? 'line-through' : ''}`}>{task.title}</h4>
              {task.description && <p className="text-emerald-600 text-sm mt-1 line-clamp-2">{task.description}</p>}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                {task.status === 'completed' && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => deleteTask(task.id)}
              className="p-2 text-red-200 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </motion.div>
        )) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-emerald-200 shadow-sm">
            <div className="bg-emerald-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Sprout className="w-10 h-10 text-emerald-300" />
            </div>
            <p className="text-emerald-900 font-bold text-xl mb-1">No tasks yet</p>
            <p className="text-emerald-500 font-medium">Add your first farm activity to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
