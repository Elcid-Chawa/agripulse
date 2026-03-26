import React, { useState, useEffect } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithPopup, 
  googleProvider, 
  signOut, 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  FirebaseUser,
  serverTimestamp
} from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  LayoutDashboard, 
  CheckSquare, 
  AlertCircle, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  ChevronRight, 
  Camera, 
  MessageSquare, 
  MapPin, 
  Calendar,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import Issues from './components/Issues';
import Profile from './components/Profile';

type View = 'dashboard' | 'tasks' | 'issues' | 'profile';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [guestSettings, setGuestSettings] = useState({
    tempUnit: 'C',
    speedUnit: 'km/h',
    language: 'English'
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Farmer',
            email: firebaseUser.email,
            role: 'farmer',
            settings: guestSettings,
            createdAt: serverTimestamp()
          });
        } else {
          const data = userDoc.data();
          if (data.settings) setGuestSettings(data.settings);
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('dashboard');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const updateGuestSettings = (newSettings: any) => {
    setGuestSettings(newSettings);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard user={user} guestSettings={guestSettings} onUpdateGuestSettings={updateGuestSettings} />;
      case 'tasks': 
        if (!user) return (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
            <div className="bg-emerald-100 p-6 rounded-full">
              <CheckSquare className="w-12 h-12 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-emerald-900">Personal Task Manager</h3>
              <p className="text-emerald-600 mt-2">Sign in to track your daily farm activities and get personalized schedules.</p>
            </div>
            <button onClick={handleLogin} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg">Sign In to Continue</button>
          </div>
        );
        return <Tasks user={user} />;
      case 'issues': return <Issues user={user} guestSettings={guestSettings} />;
      case 'profile': 
        if (!user) return (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
            <div className="bg-emerald-100 p-6 rounded-full">
              <UserIcon className="w-12 h-12 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-emerald-900">Your Farm Profile</h3>
              <p className="text-emerald-600 mt-2">Sign in to manage your farm details, preferences, and saved issues.</p>
            </div>
            <button onClick={handleLogin} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg">Sign In to Continue</button>
          </div>
        );
        return <Profile user={user} onLogout={handleLogout} />;
      default: return <Dashboard user={user} guestSettings={guestSettings} onUpdateGuestSettings={updateGuestSettings} />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'issues', icon: AlertCircle, label: 'Issues' },
    { id: 'profile', icon: UserIcon, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-emerald-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-emerald-100 px-6 py-4 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sprout className="w-8 h-8 text-emerald-600" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-emerald-900 leading-none">AgriPulse</span>
            <div className="flex items-center gap-1 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_4px_#10b981]' : 'bg-red-500 shadow-[0_0_4px_#ef4444]'}`}></div>
              <span className="text-[8px] font-bold uppercase tracking-tighter text-emerald-400">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!user && (
            <button 
              onClick={handleLogin}
              className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg"
            >
              Sign In
            </button>
          )}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-50 border-b border-red-100 overflow-hidden"
          >
            <div className="px-6 py-2 flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Offline Mode: Data may not sync in real-time</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-white z-50 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-2">
                <Sprout className="w-8 h-8 text-emerald-600" />
                <span className="text-xl font-bold text-emerald-900">AgriPulse</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2"><X /></button>
            </div>
            <nav className="flex flex-col gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as View);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-4 p-4 rounded-2xl text-lg font-medium transition-colors ${currentView === item.id ? 'bg-emerald-600 text-white' : 'text-emerald-800 hover:bg-emerald-50'}`}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </button>
              ))}
              {user && (
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 p-4 rounded-2xl text-lg font-medium text-red-600 hover:bg-red-50 mt-auto"
                >
                  <LogOut className="w-6 h-6" />
                  Sign Out
                </button>
              )}
              {!user && (
                <button 
                  onClick={handleLogin}
                  className="flex items-center gap-4 p-4 rounded-2xl text-lg font-medium bg-emerald-600 text-white mt-auto"
                >
                  <UserIcon className="w-6 h-6" />
                  Sign In
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 flex justify-around items-center py-4 px-2 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={`flex flex-col items-center gap-1 transition-colors ${currentView === item.id ? 'text-emerald-600' : 'text-emerald-400'}`}
          >
            <item.icon className={`w-6 h-6 ${currentView === item.id ? 'fill-emerald-600/10' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
