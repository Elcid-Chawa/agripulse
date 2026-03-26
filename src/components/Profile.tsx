import React, { useState, useEffect } from 'react';
import { db, doc, getDoc, updateDoc, FirebaseUser } from '../firebase';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Sprout, 
  LogOut, 
  ChevronRight, 
  Settings, 
  ShieldCheck, 
  HelpCircle,
  Loader2,
  Edit2,
  Save
} from 'lucide-react';

interface ProfileProps {
  user: FirebaseUser;
  onLogout: () => void;
}

export default function Profile({ user, onLogout }: ProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
        setEditedName(docSnap.data().displayName);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user.uid]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: editedName
      });
      setProfile({ ...profile, displayName: editedName });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-12 h-12 text-emerald-600" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-emerald-600 p-2 rounded-full border-2 border-white shadow-md">
            <Edit2 className="w-3 h-3 text-white" />
          </div>
        </div>
        <div className="text-center">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-bold text-emerald-900 border-b-2 border-emerald-600 bg-transparent text-center focus:outline-none"
              />
              <button onClick={handleUpdateProfile} className="text-emerald-600"><Save className="w-5 h-5" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <h2 className="text-2xl font-bold text-emerald-900">{profile?.displayName || user.displayName}</h2>
              <button onClick={() => setIsEditing(true)} className="text-emerald-400 hover:text-emerald-600"><Edit2 className="w-4 h-4" /></button>
            </div>
          )}
          <p className="text-emerald-500 font-medium">{user.email}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-emerald-100">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl font-bold text-emerald-900">12</span>
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Tasks Done</span>
        </div>
        <div className="flex flex-col items-center gap-1 border-x border-emerald-50">
          <span className="text-xl font-bold text-emerald-900">3</span>
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Farms</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl font-bold text-emerald-900">5</span>
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Issues Fixed</span>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest ml-2">Account Settings</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden">
          <button className="w-full flex items-center justify-between p-5 hover:bg-emerald-50 transition-colors border-b border-emerald-50">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600"><Sprout className="w-5 h-5" /></div>
              <span className="font-bold text-emerald-900">My Farms</span>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-200" />
          </button>
          <button className="w-full flex items-center justify-between p-5 hover:bg-emerald-50 transition-colors border-b border-emerald-50">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-600"><ShieldCheck className="w-5 h-5" /></div>
              <span className="font-bold text-emerald-900">Security & Privacy</span>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-200" />
          </button>
          <button className="w-full flex items-center justify-between p-5 hover:bg-emerald-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 p-2 rounded-xl text-orange-600"><Settings className="w-5 h-5" /></div>
              <span className="font-bold text-emerald-900">Preferences</span>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-200" />
          </button>
        </div>

        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest ml-2 mt-6">Support</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden">
          <button className="w-full flex items-center justify-between p-5 hover:bg-emerald-50 transition-colors border-b border-emerald-50">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-2 rounded-xl text-purple-600"><HelpCircle className="w-5 h-5" /></div>
              <span className="font-bold text-emerald-900">Help Center</span>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-200" />
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-50 p-2 rounded-xl text-red-600"><LogOut className="w-5 h-5" /></div>
              <span className="font-bold text-red-600">Sign Out</span>
            </div>
            <ChevronRight className="w-5 h-5 text-red-200" />
          </button>
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">AgriPulse AI v1.0.0</p>
        <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mt-1">Build With AI Challenge 2026</p>
      </div>
    </div>
  );
}
