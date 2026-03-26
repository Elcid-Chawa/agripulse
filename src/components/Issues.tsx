import React, { useState, useEffect, useRef } from 'react';
import { db, collection, query, where, onSnapshot, addDoc, serverTimestamp, FirebaseUser, doc, getDoc } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles, 
  X, 
  Loader2, 
  Image as ImageIcon,
  Send,
  ChevronRight
} from 'lucide-react';
import { analyzeCropIssue, getAgriculturalAdvice } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface IssuesProps {
  user: FirebaseUser | null;
  guestSettings: any;
}

export default function Issues({ user, guestSettings }: IssuesProps) {
  const [issues, setIssues] = useState<any[]>([]);
  const [isReporting, setIsReporting] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', description: '', image: '' });
  const [loading, setLoading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let issuesQuery;
    if (user) {
      issuesQuery = query(collection(db, 'issues'), where('farmerId', '==', user.uid));
    } else {
      // For guests, show all public issues (or just all for now)
      issuesQuery = query(collection(db, 'issues'));
    }
    
    const unsubscribe = onSnapshot(issuesQuery, (snapshot) => {
      setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewIssue({ ...newIssue, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssue.title) return;
    setLoading(true);
    
    const language = user ? (await getDoc(doc(db, 'users', user.uid))).data()?.settings?.language || guestSettings.language : guestSettings.language;

    let aiResponse = "";
    if (newIssue.image) {
      aiResponse = await analyzeCropIssue(newIssue.image, newIssue.description, language);
    } else {
      aiResponse = await getAgriculturalAdvice(newIssue.description || newIssue.title, "Crop issue analysis", language);
    }

    try {
      await addDoc(collection(db, 'issues'), {
        farmerId: user?.uid || 'guest',
        title: newIssue.title,
        description: newIssue.description,
        imageUrl: newIssue.image || null,
        aiResponse: aiResponse,
        expertResponse: null,
        status: 'open',
        createdAt: serverTimestamp()
      });
      setNewIssue({ title: '', description: '', image: '' });
      setIsReporting(false);
    } catch (error) {
      console.error("Error reporting issue:", error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-emerald-900">Crop Issues</h2>
        <button 
          onClick={() => setIsReporting(true)}
          className="bg-red-600 text-white p-3 rounded-2xl shadow-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {isReporting && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-6 rounded-3xl shadow-xl border border-red-100 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-red-900">Report an Issue</h3>
              <button onClick={() => setIsReporting(false)} className="text-red-400 hover:text-red-600"><X /></button>
            </div>
            <form onSubmit={handleReportIssue} className="space-y-4">
              <input 
                type="text" 
                placeholder="Issue Title (e.g., Yellowing Leaves)"
                value={newIssue.title}
                onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                className="w-full p-4 rounded-2xl bg-red-50 border-none focus:ring-2 focus:ring-red-500 text-red-900 font-medium"
                required
              />
              <textarea 
                placeholder="Describe the symptoms..."
                value={newIssue.description}
                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                className="w-full p-4 rounded-2xl bg-red-50 border-none focus:ring-2 focus:ring-red-500 text-red-900 font-medium min-h-[100px]"
              />
              
              <div className="flex flex-col gap-2">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-50 text-emerald-700 font-bold border-2 border-dashed border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  {newIssue.image ? <ImageIcon className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
                  {newIssue.image ? 'Change Photo' : 'Add Photo for AI Analysis'}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {newIssue.image && (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-emerald-200">
                    <img src={newIssue.image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setNewIssue({ ...newIssue, image: '' })}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Analyze & Report
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {issues.length > 0 ? issues.map((issue) => (
          <motion.div 
            layout
            key={issue.id} 
            onClick={() => setSelectedIssue(issue)}
            className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 flex items-center gap-4 cursor-pointer hover:border-emerald-300 transition-all"
          >
            <div className={`p-3 rounded-xl ${issue.status === 'open' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {issue.status === 'open' ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-lg text-emerald-900 truncate">{issue.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${issue.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {issue.status}
                </span>
                <span className="text-xs text-emerald-400 font-medium">
                  {issue.createdAt?.toDate().toLocaleDateString()}
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-200" />
          </motion.div>
        )) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-emerald-200 shadow-sm">
            <div className="bg-red-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-300" />
            </div>
            <p className="text-emerald-900 font-bold text-xl mb-1">No issues reported</p>
            <p className="text-emerald-500 font-medium">Report any crop problems to get AI assistance.</p>
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedIssue(null)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] max-h-[90vh] overflow-y-auto p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-emerald-900">{selectedIssue.title}</h3>
                  <p className="text-emerald-500 font-medium">{selectedIssue.createdAt?.toDate().toLocaleDateString()}</p>
                </div>
                <button onClick={() => setSelectedIssue(null)} className="p-2 bg-emerald-50 rounded-full text-emerald-600"><X /></button>
              </div>

              {selectedIssue.imageUrl && (
                <div className="w-full aspect-video rounded-3xl overflow-hidden mb-6 border border-emerald-100 shadow-sm">
                  <img src={selectedIssue.imageUrl} alt="Issue" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Description</h4>
                  <p className="text-emerald-800 leading-relaxed">{selectedIssue.description || "No description provided."}</p>
                </div>

                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-emerald-900">AI Analysis</h4>
                  </div>
                  <div className="prose prose-emerald prose-sm max-w-none text-emerald-800">
                    <ReactMarkdown>{selectedIssue.aiResponse}</ReactMarkdown>
                  </div>
                </div>

                {selectedIssue.expertResponse && (
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <h4 className="font-bold text-blue-900">Expert Feedback</h4>
                    </div>
                    <p className="text-blue-800 text-sm leading-relaxed">{selectedIssue.expertResponse}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedIssue(null)}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg mt-8 shadow-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
