import React, { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, FirebaseUser } from '../firebase';
import { motion } from 'motion/react';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Thermometer, 
  Sprout, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import { getAgriculturalAdvice } from '../services/geminiService';

interface DashboardProps {
  user: FirebaseUser;
}

export default function Dashboard({ user }: DashboardProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    const tasksQuery = query(collection(db, 'tasks'), where('status', '==', 'pending'));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const issuesQuery = query(collection(db, 'issues'), where('status', '==', 'open'));
    const unsubscribeIssues = onSnapshot(issuesQuery, (snapshot) => {
      setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeTasks();
      unsubscribeIssues();
    };
  }, []);

  const fetchAiAdvice = async () => {
    setLoadingAdvice(true);
    const advice = await getAgriculturalAdvice("Give me a quick tip for today's farming activities based on current season.");
    setAiAdvice(advice);
    setLoadingAdvice(false);
  };

  useEffect(() => {
    fetchAiAdvice();
  }, []);

  const weather = {
    temp: 28,
    humidity: 65,
    wind: 12,
    condition: 'Sunny'
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-emerald-900">Hello, {user.displayName?.split(' ')[0]}!</h2>
        <p className="text-emerald-600 font-medium">Here's what's happening on your farm today.</p>
      </div>

      {/* Weather Widget */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-3xl shadow-lg text-white">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <span className="text-emerald-100 font-medium uppercase tracking-widest text-xs mb-1">Local Weather</span>
            <span className="text-4xl font-bold">{weather.temp}°C</span>
            <span className="text-emerald-100 font-medium">{weather.condition}</span>
          </div>
          <CloudSun className="w-12 h-12 text-emerald-200" />
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div className="flex flex-col items-center gap-1">
            <Droplets className="w-5 h-5 text-emerald-200" />
            <span className="text-xs font-bold">{weather.humidity}%</span>
            <span className="text-[10px] uppercase text-emerald-100">Humidity</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Wind className="w-5 h-5 text-emerald-200" />
            <span className="text-xs font-bold">{weather.wind} km/h</span>
            <span className="text-[10px] uppercase text-emerald-100">Wind</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Thermometer className="w-5 h-5 text-emerald-200" />
            <span className="text-xs font-bold">High</span>
            <span className="text-[10px] uppercase text-emerald-100">32°C</span>
          </div>
        </div>
      </div>

      {/* AI Daily Insight */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="w-16 h-16 text-emerald-600" />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-emerald-100 p-2 rounded-xl">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-emerald-900">AI Daily Insight</h3>
        </div>
        {loadingAdvice ? (
          <div className="flex items-center gap-2 text-emerald-600 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Generating advice...</span>
          </div>
        ) : (
          <p className="text-emerald-800 text-sm leading-relaxed italic">
            "{aiAdvice || "Keep an eye on the soil moisture today. The upcoming heat might dry out the topsoil faster than usual."}"
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 flex flex-col gap-3">
          <div className="bg-orange-100 p-2 rounded-xl w-fit">
            <CheckSquare className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <span className="text-3xl font-bold text-emerald-900">{tasks.length}</span>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Pending Tasks</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 flex flex-col gap-3">
          <div className="bg-red-100 p-2 rounded-xl w-fit">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <span className="text-3xl font-bold text-emerald-900">{issues.length}</span>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Active Issues</p>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks Preview */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-emerald-900">Upcoming Tasks</h3>
          <button className="text-emerald-600 font-bold text-sm flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {tasks.length > 0 ? tasks.slice(0, 2).map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-xl">
                <Sprout className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-emerald-900">{task.title}</h4>
                <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                  <Calendar className="w-3 h-3" />
                  <span>Due Today</span>
                </div>
              </div>
              <button className="p-2 text-emerald-300 hover:text-emerald-600 transition-colors">
                <CheckCircle2 className="w-6 h-6" />
              </button>
            </div>
          )) : (
            <div className="text-center py-8 bg-emerald-50/50 rounded-3xl border border-dashed border-emerald-200">
              <p className="text-emerald-600 font-medium">No pending tasks for today!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
