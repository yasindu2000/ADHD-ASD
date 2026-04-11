import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function BreakTimer() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(600); // 10 minutes = 600 seconds

  useEffect(() => {
    if (seconds > 0) {
      const timer = setInterval(() => setSeconds(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      // Time zero unama lesson page ekata redirect karanawa
      navigate(-1); // Kalin hitiya lesson ekata yanawa
    }
  }, [seconds, navigate]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#E0F7FA] flex flex-col items-center justify-center font-sans">
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 bg-[#B2EBF2] px-4 py-2 rounded-lg font-bold shadow-sm"
      >
        ← DashBoard
      </button>
      
      <h1 className="text-6xl font-black text-gray-800 mb-12">Time : {formatTime(seconds)}</h1>
      
      <div className="relative flex items-center justify-center">
        {/* Animated Green Circle */}
        <div className="w-64 h-64 rounded-full bg-[#00E676] border-[12px] border-white shadow-xl flex items-center justify-center animate-pulse">
           <span className="text-5xl font-black text-white">Break</span>
        </div>
      </div>
      
      <p className="mt-10 text-xl font-bold text-gray-600">Take a deep breath and relax! 🌿</p>
    </div>
  );
}

export default BreakTimer;