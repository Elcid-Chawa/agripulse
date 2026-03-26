import React, { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, FirebaseUser, doc, getDoc } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
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
  CheckSquare,
  Globe,
  Settings,
  X,
  Loader2
} from 'lucide-react';
import { getAgriculturalAdvice, getPlantingSchedule } from '../services/geminiService';

interface DashboardProps {
  user: FirebaseUser | null;
  guestSettings: any;
  onUpdateGuestSettings: (settings: any) => void;
}

export default function Dashboard({ user, guestSettings, onUpdateGuestSettings }: DashboardProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [settings, setSettings] = useState(guestSettings);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showGuestSettings, setShowGuestSettings] = useState(false);
  const [scheduleCrop, setScheduleCrop] = useState("");
  const [scheduleLocation, setScheduleLocation] = useState("");
  const [generatedSchedule, setGeneratedSchedule] = useState("");
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchSettings = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().settings) {
          setSettings(docSnap.data().settings);
        }
      };
      fetchSettings();
    } else {
      setSettings(guestSettings);
    }
  }, [user, guestSettings]);

  useEffect(() => {
    if (user) {
      const tasksQuery = query(collection(db, 'tasks'), where('status', '==', 'pending'), where('farmId', '==', user.uid));
      const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      const issuesQuery = query(collection(db, 'issues'), where('status', '==', 'open'), where('farmerId', '==', user.uid));
      const unsubscribeIssues = onSnapshot(issuesQuery, (snapshot) => {
        setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => {
        unsubscribeTasks();
        unsubscribeIssues();
      };
    }
  }, [user]);

  const fetchAiAdvice = async () => {
    setLoadingAdvice(true);
    const advice = await getAgriculturalAdvice("Give me a quick tip for today's farming activities based on current season in East Africa.", "East Africa Farming", settings.language);
    setAiAdvice(advice);
    setLoadingAdvice(false);
  };

  const handleGenerateSchedule = async () => {
    if (!scheduleCrop || !scheduleLocation) return;
    setLoadingSchedule(true);
    const schedule = await getPlantingSchedule(scheduleCrop, scheduleLocation, settings.language);
    setGeneratedSchedule(schedule);
    setLoadingSchedule(false);
  };

  const handleUpdateGuestSettings = (newSettings: any) => {
    setSettings(newSettings);
    onUpdateGuestSettings(newSettings);
  };

  useEffect(() => {
    fetchAiAdvice();
  }, [settings.language]);

  const weather = {
    temp: settings.tempUnit === 'C' ? 28 : Math.round((28 * 9/5) + 32),
    humidity: 65,
    wind: settings.speedUnit === 'km/h' ? 12 : Math.round(12 / 1.609),
    condition: 'Sunny',
    high: settings.tempUnit === 'C' ? 32 : Math.round((32 * 9/5) + 32)
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-emerald-900">
            {user ? `Hello, ${user.displayName?.split(' ')[0]}!` : "Welcome, Farmer!"}
          </h2>
          <p className="text-emerald-600 font-medium">Your AI-driven agricultural hub for East Africa.</p>
        </div>
        {!user && (
          <button 
            onClick={() => setShowGuestSettings(!showGuestSettings)}
            className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-100 text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Guest Settings Panel */}
      <AnimatePresence>
        {showGuestSettings && !user && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white p-6 rounded-[32px] shadow-sm border border-orange-100 space-y-4 overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-orange-500" />
                Language & Units
              </h3>
              <button onClick={() => setShowGuestSettings(false)} className="text-emerald-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-800">Language</span>
                <select 
                  value={settings.language}
                  onChange={(e) => handleUpdateGuestSettings({ ...settings, language: e.target.value })}
                  className="bg-emerald-50 border-none rounded-xl text-xs font-bold text-emerald-600 p-2"
                >
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Swahili">Swahili</option>
                  <option value="Hausa">Hausa</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-800">Temperature</span>
                <div className="flex bg-emerald-50 p-1 rounded-xl">
                  <button 
                    onClick={() => handleUpdateGuestSettings({ ...settings, tempUnit: 'C' })}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold ${settings.tempUnit === 'C' ? 'bg-white text-emerald-600 shadow-sm' : 'text-emerald-400'}`}
                  >
                    °C
                  </button>
                  <button 
                    onClick={() => handleUpdateGuestSettings({ ...settings, tempUnit: 'F' })}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold ${settings.tempUnit === 'F' ? 'bg-white text-emerald-600 shadow-sm' : 'text-emerald-400'}`}
                  >
                    °F
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather Widget */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-3xl shadow-lg text-white">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <span className="text-emerald-100 font-medium uppercase tracking-widest text-xs mb-1">Local Weather</span>
            <span className="text-4xl font-bold">{weather.temp}°{settings.tempUnit}</span>
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
            <span className="text-xs font-bold">{weather.wind} {settings.speedUnit}</span>
            <span className="text-[10px] uppercase text-emerald-100">Wind</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Thermometer className="w-5 h-5 text-emerald-200" />
            <span className="text-xs font-bold">High</span>
            <span className="text-[10px] uppercase text-emerald-100">{weather.high}°{settings.tempUnit}</span>
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
      {user && (
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
      )}

      {/* Climate-Smart Advisory */}
      <div className="bg-emerald-900 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 opacity-10">
          <Sprout className="w-48 h-48" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Climate-Smart Planning</h3>
        <p className="text-emerald-200 text-sm mb-6 leading-relaxed">Get a localized planting schedule based on current weather patterns and soil health.</p>
        <button 
          onClick={() => setShowScheduleModal(true)}
          className="bg-white text-emerald-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:bg-emerald-50 transition-colors"
        >
          Generate Schedule
        </button>
      </div>

      {/* Upcoming Tasks Preview */}
      {user && (
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
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[40px] p-8 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-emerald-900">Planting Schedule</h3>
                <button onClick={() => setShowScheduleModal(false)} className="p-2 bg-emerald-50 rounded-full text-emerald-600"><X /></button>
              </div>

              {!generatedSchedule ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest ml-1">What are you planting?</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Maize, Beans, Coffee"
                      value={scheduleCrop}
                      onChange={(e) => setScheduleCrop(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-emerald-50 border-none focus:ring-2 focus:ring-emerald-500 text-emerald-900 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest ml-1">Where is your farm?</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Nakuru, Kenya"
                      value={scheduleLocation}
                      onChange={(e) => setScheduleLocation(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-emerald-50 border-none focus:ring-2 focus:ring-emerald-500 text-emerald-900 font-medium"
                    />
                  </div>
                  <button 
                    onClick={handleGenerateSchedule}
                    disabled={loadingSchedule || !scheduleCrop || !scheduleLocation}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {loadingSchedule ? <Loader2 className="w-6 h-6 animate-spin" /> : "Generate Advisor"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="prose prose-emerald prose-sm max-w-none text-emerald-800 bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-bold text-emerald-900 m-0">AI Advisor</h4>
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {generatedSchedule}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setGeneratedSchedule("");
                      setScheduleCrop("");
                      setScheduleLocation("");
                    }}
                    className="w-full bg-emerald-100 text-emerald-700 py-4 rounded-2xl font-bold"
                  >
                    New Schedule
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
