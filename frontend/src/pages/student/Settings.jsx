import React, { useState, useEffect } from 'react';
import { useSensory } from '../../context/SensoryContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Settings() {
  const { 
    animationsEnabled, setAnimationsEnabled,
    isDyslexiaMode, setIsDyslexiaMode,
    playUiSound
  } = useSensory();
  const navigate = useNavigate();

  // Avatar Options
  const avatarList = [
    '/avatars/avatar_lion_1784646383235.png',
    '/avatars/avatar_elephant_1784646402171.png',
    '/avatars/avatar_panda_1784646419091.png',
    '/avatars/avatar_owl_1784646446356.png',
    '/avatars/avatar_fox_1784646472317.png',
    '/avatars/avatar_tiger_1784646506846.png',
    '/avatars/avatar_penguin_1784646529294.png',
    '/avatars/avatar_koala_1784646561413.png',
    '/avatars/avatar_monkey_1784646585412.png',
    '/avatars/avatar_puppy_1784646608374.png'
  ];

  const [user, setUser] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarList[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    // Load user data from localStorage
    const savedUserStr = localStorage.getItem('user');
    if (savedUserStr) {
      const savedUser = JSON.parse(savedUserStr);
      setUser(savedUser);
      if (savedUser.avatar) {
        setSelectedAvatar(savedUser.avatar);
      }
    } else {
      // Fallback if full user object is not saved
      const userId = localStorage.getItem("userId");
      if (userId) {
        const fallbackUser = {
          _id: userId,
          fullName: localStorage.getItem("userName") || "Student",
          grade: localStorage.getItem("studentGrade")?.replace('Grade ', '') || "N/A",
          email: "student@example.com" // Placeholder since it's not in localStorage
        };
        setUser(fallbackUser);
        setSelectedAvatar(avatarList[0]);
      }
    }
  }, []);

  const handleToggleAnimations = () => {
    setAnimationsEnabled(!animationsEnabled);
    playUiSound();
  };

  const handleToggleDyslexia = () => {
    setIsDyslexiaMode(!isDyslexiaMode);
    playUiSound();
  };

  const saveProfile = async (newAvatar) => {
    playUiSound();
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/auth/update-profile/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: newAvatar })
      });
      const data = await response.json();

      if (response.ok) {
        // Update local storage
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        toast.success("Profile avatar updated successfully! 🌟");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
      setShowAvatarPicker(false);
    }
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    saveProfile(avatar);
  };

  if (!user) return <div className="p-8 text-slate-500 font-bold">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
            Profile & <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">Settings</span>
          </h1>
          <p className="text-slate-500 font-bold mt-2 text-lg">
            Manage your account and preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
        
        {/* STUDENT PROFILE SECTION */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-100 to-transparent"></div>
          
          <h2 className="text-2xl font-black text-slate-800 mb-6 z-10 w-full text-left">Your Profile</h2>

          {/* AVATAR */}
          <div className="relative z-10 mb-6 group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-sky-50 flex items-center justify-center">
              <img src={selectedAvatar} alt="Profile Avatar" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            <button 
              onClick={() => { playUiSound(); setShowAvatarPicker(!showAvatarPicker); }}
              className="absolute bottom-2 right-2 bg-indigo-500 text-white p-3 rounded-full shadow-md hover:bg-indigo-600 transition-all cursor-pointer hover:scale-110"
              title="Change Avatar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
          </div>

          <h3 className="text-3xl font-black text-slate-800 mb-1 z-10">{user.fullName}</h3>
          <p className="text-indigo-500 font-bold uppercase tracking-widest text-sm mb-6 z-10">Grade {user.grade}</p>
          
          <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-left z-10">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Email Address</p>
              <p className="text-slate-700 font-bold">{user.email}</p>
            </div>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm">
              ✉️
            </div>
          </div>
        </div>

        {/* SETTINGS SECTION */}
        <div className="space-y-8">
          
          {/* AVATAR PICKER WIDGET */}
          {showAvatarPicker && (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">Choose Avatar</h2>
                <button onClick={() => setShowAvatarPicker(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕ Close</button>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                {avatarList.map((avatar, index) => (
                  <button
                    key={index}
                    disabled={isSaving}
                    onClick={() => handleAvatarSelect(avatar)}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 overflow-hidden transition-all cursor-pointer ${
                      selectedAvatar === avatar ? 'border-indigo-500 shadow-md scale-110' : 'border-transparent hover:border-sky-300 hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={avatar} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              {isSaving && <p className="text-center text-indigo-500 font-bold mt-4 animate-pulse">Saving avatar...</p>}
            </div>
          )}

          {/* ANIMATIONS SETTING */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-100 text-fuchsia-500 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-1">Motion & Animations</h2>
                <p className="text-slate-500 font-bold text-sm">
                  Turn off moving parts if they are too distracting for you.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-700 text-lg">
                {animationsEnabled ? "Animations are ON" : "Animations are OFF"}
              </span>
              <button 
                onClick={handleToggleAnimations}
                className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out cursor-pointer ${
                  animationsEnabled ? 'bg-fuchsia-500' : 'bg-slate-300'
                }`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                  animationsEnabled ? 'translate-x-8' : 'translate-x-0'
                }`}></div>
              </button>
            </div>
          </div>

          {/* DYSLEXIA FONT SETTING */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-500 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-1">Dyslexia Font</h2>
                <p className="text-slate-500 font-bold text-sm">
                  Use a font that is easier to read if you have dyslexia.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-700 text-lg">
                {isDyslexiaMode ? "Dyslexia Font is ON" : "Dyslexia Font is OFF"}
              </span>
              <button 
                onClick={handleToggleDyslexia}
                className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out cursor-pointer ${
                  isDyslexiaMode ? 'bg-sky-500' : 'bg-slate-300'
                }`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                  isDyslexiaMode ? 'translate-x-8' : 'translate-x-0'
                }`}></div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Settings;
