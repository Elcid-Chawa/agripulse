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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user exists in Firestore, if not create
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Farmer',
            email: firebaseUser.email,
            role: 'farmer',
            createdAt: serverTimestamp()
          });
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-emerald-50">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-emerald-50 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full"
        >
          <div className="bg-emerald-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Sprout className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">AgriPulse AI</h1>
          <p className="text-emerald-700 mb-8">Your intelligent companion for sustainable and productive farming.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 bg-white rounded-full p-1" />
            Sign in with Google
          </button>
          <p className="mt-6 text-xs text-emerald-500 uppercase tracking-widest font-bold">Build With AI Challenge</p>
        </motion.div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'tasks': return <Tasks user={user} />;
      case 'issues': return <Issues user={user} />;
      case 'profile': return <Profile user={user} onLogout={handleLogout} />;
      default: return <Dashboard user={user} />;
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
          <span className="text-xl font-bold text-emerald-900">AgriPulse</span>
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

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
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 p-4 rounded-2xl text-lg font-medium text-red-600 hover:bg-red-50 mt-auto"
              >
                <LogOut className="w-6 h-6" />
                Sign Out
              </button>
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
