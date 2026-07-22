import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('Student');
  const [userAvatar, setUserAvatar] = useState(null);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Simple Stats for Gamification & Simple Chart
  const [stats, setStats] = useState({
    totalStars: 0,
    totalTrophies: 0,
    weeklyStreak: [false, false, false, false, false],
    weeklyScores: [
      { day: 'Mon', score: 0 }, { day: 'Tue', score: 0 },
      { day: 'Wed', score: 0 }, { day: 'Thu', score: 0 }, { day: 'Fri', score: 0 }
    ],
    nextLessons: []
  });

  const [gamification, setGamification] = useState({
    level: 1,
    totalPoints: 0,
    badges: []
  });

  const today = new Date();
  const currentDateString = today.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  });

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      const storedUser = JSON.parse(storedUserStr);
      if (storedUser.fullName) {
        const name = storedUser.fullName;
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
      if (storedUser.avatar) setUserAvatar(storedUser.avatar);
    } else {
      const storedName = localStorage.getItem('userName');
      if (storedName) {
        setUserName(storedName.charAt(0).toUpperCase() + storedName.slice(1));
      }
    }

    const fetchDashboardStats = async () => {
      try {
        const studentId = localStorage.getItem('userId');
        if (!studentId) return;

        const response = await fetch(`http://localhost:5000/api/lessons/dashboard-stats/${studentId}`);
        const data = await response.json();

        if (data.success) {
          // Gamification data
          if (data.gamification) {
            setGamification(data.gamification);
          }
          
          // Latest lessons logic
          if (data.latestLessons && data.latestLessons.length > 0) {
             setStats(prev => ({
                ...prev,
                nextLessons: data.latestLessons.map(l => ({
                   id: l._id,
                   title: l.title,
                }))
             }));
          }

          if (data.progress) {
            let tCorrect = 0;
          let tQuizzes = 0;
          let streak = [false, false, false, false, false];

          const now = new Date();
          const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
          const mondayDate = new Date(now);
          mondayDate.setHours(0, 0, 0, 0);
          mondayDate.setDate(now.getDate() - dayOfWeek + 1);

          const weeklyDataTemplate = [
            { name: 'Mon', Score: 0, count: 0 },
            { name: 'Tue', Score: 0, count: 0 },
            { name: 'Wed', Score: 0, count: 0 },
            { name: 'Thu', Score: 0, count: 0 },
            { name: 'Fri', Score: 0, count: 0 }
          ];

          let recentLessonObj = null; // No longer needed for Next Mission, keeping logic simple

          data.progress.forEach(p => {
            if (p.isQuizCompleted) {
              tQuizzes += 1;
              tCorrect += (p.correctAnswers || 0);

              if (p.quizAttempts && p.quizAttempts.length > 0) {
                p.quizAttempts.forEach(attempt => {
                  const quizDate = new Date(attempt.date);
                  if (quizDate >= mondayDate) {
                    const dayIndex = quizDate.getDay();
                    if (dayIndex >= 1 && dayIndex <= 5) {
                      const arrIndex = dayIndex - 1;
                      streak[arrIndex] = true;

                      weeklyDataTemplate[arrIndex].Score += (attempt.score || 0);
                      weeklyDataTemplate[arrIndex].count += 1;
                    }
                  }
                });
              } else {
                const quizDate = new Date(p.updatedAt || Date.now());
                if (quizDate >= mondayDate) {
                  const dayIndex = quizDate.getDay();
                  if (dayIndex >= 1 && dayIndex <= 5) {
                    const arrIndex = dayIndex - 1;
                    streak[arrIndex] = true;

                    weeklyDataTemplate[arrIndex].Score += (p.quizScore || 0);
                    weeklyDataTemplate[arrIndex].count += 1;
                  }
                }
              }
            }
          });

          const finalScores = weeklyDataTemplate.map(day => ({
            day: day.name,
            score: day.count > 0 ? Math.round(day.Score / day.count) : 0
          }));

          setStats(prev => ({
            ...prev,
            totalStars: tCorrect,
            totalTrophies: tQuizzes,
            weeklyStreak: streak,
            weeklyScores: finalScores
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#F4F8FB] flex items-center justify-center gap-3 font-bold text-gray-500 text-2xl">
      <svg className="animate-spin h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      Loading your space...
    </div>
  );

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="min-h-screen bg-[#F4F8FB] pb-12 px-4 md:px-8 font-sans">

      {/* 1. CALM & CLEAR HEADER */}
      <div className="max-w-5xl mx-auto pt-2 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-700 tracking-tight flex items-center gap-4">
            Hello, {userName}!
            {userAvatar ? (
              <img src={userAvatar} alt="Avatar" className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-md object-cover bg-sky-50" />
            ) : (
              <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            )}
          </h1>
          <p className="text-slate-600 font-bold mt-2 text-xl">{currentDateString}</p>
        </div>
        <div className="flex items-center">
          <span className="text-3xl md:text-4xl font-black text-slate-700 tracking-wide">{timeString}</span>
        </div>
      </div>

      {/* 🌟 2. FEELINGS TRACKER (Moved to top, full width for balance) 🌟 */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-700 mb-6">How are you feeling right now?</h3>
          <div className="flex flex-wrap gap-4">
            {['🤩', '😊', '🙂', '😐', '🥱', '😟'].map((emoji, index) => {
              const isSelected = selectedFeeling === index;
              const hasSelection = selectedFeeling !== null;
              return (
                <button
                  key={index} onClick={() => setSelectedFeeling(index)}
                  className={`text-5xl cursor-pointer transition-all duration-300 p-4 rounded-3xl
                    ${isSelected ? 'bg-sky-50 border-4 border-sky-200 scale-110 shadow-md' : 'bg-slate-50 border-4 border-transparent hover:scale-105 hover:bg-slate-100'} 
                    ${hasSelection && !isSelected ? 'opacity-40 grayscale-[50%]' : 'opacity-100'}
                  `}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
          {selectedFeeling !== null && (
            <div className="mt-6 text-sky-700 font-bold text-lg animate-in fade-in">
              {selectedFeeling <= 2 ? "Awesome! You're ready to learn! 🚀" : "Take a deep breath. You're doing great! 💙"}
            </div>
          )}
        </div>
      </div>

      {/* 🌟 2-COLUMN BALANCED LAYOUT 🌟 */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* LEFT COLUMN (Focus Zone + Daily Scores) */}
        <div className="md:col-span-7 flex flex-col gap-8">

          {/* FOCUS ZONE */}
          <div className="bg-sky-50 rounded-[1.5rem] p-6 shadow-md border border-sky-100 relative overflow-hidden flex-1">
            <div className="absolute -right-10 -bottom-10 opacity-20">
              <svg className="w-64 h-64 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div className="relative z-10">
              <h2 className="text-sky-800 font-bold text-lg mb-4 opacity-90">YOUR NEXT MISSIONS</h2>

              {stats.nextLessons.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {stats.nextLessons.map((lesson, idx) => (
                    <div key={idx} className="bg-white/80 backdrop-blur-sm border border-sky-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-xl font-black text-slate-800 flex-1 pr-4 truncate">
                        {lesson.title}
                      </h3>
                      <button
                        onClick={() => navigate(`/lesson-view/${lesson.id}`)}
                        className="bg-sky-500 text-white px-5 py-2 rounded-xl font-bold text-sm shadow hover:bg-sky-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <h3 className="text-3xl font-black text-slate-800 mb-5 leading-tight mt-2">
                    Start a New Adventure!
                  </h3>
                  <button
                    onClick={() => navigate('/lessons')}
                    className="bg-white text-sky-700 border border-sky-100 px-6 py-3 rounded-2xl font-black text-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-3 w-fit"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    Open Library
                  </button>
                </>
              )}
            </div>
          </div>

          {/* SIMPLE DAILY SCORE CHART */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              My Daily Scores
            </h3>

            <div className="flex justify-between items-end h-40 gap-2">
              {stats.weeklyScores.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-end h-full w-full group">
                  <span className={`text-sm font-black mb-1 ${item.score > 0 ? 'text-sky-700' : 'text-transparent'}`}>
                    {item.score}%
                  </span>

                  <div className="w-full max-w-[40px] bg-slate-50 rounded-t-xl relative h-[120px] flex items-end overflow-hidden border border-slate-100 border-b-0">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-1000 ease-out ${item.score === 100 ? 'bg-emerald-200' : 'bg-sky-200'}`}
                      style={{ height: `${item.score}%` }}
                    ></div>
                  </div>

                  <span className="text-sm font-bold text-slate-600 mt-2">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Rewards + Weekly Streak) */}
        <div className="md:col-span-5 flex flex-col gap-8">

          {/* PREMIUM GAMIFICATION & REWARDS */}
          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 flex flex-col w-full">
            <h3 className="text-lg font-bold text-slate-700 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd"></path></svg>
              My Journey
            </h3>

            {/* Level & Progress */}
            <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-2xl p-5 mb-5 border border-sky-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <svg className="w-20 h-20 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              </div>
              <div className="relative z-10 flex justify-between items-end mb-2">
                <div>
                  <div className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Current Level</div>
                  <div className="text-3xl font-black text-indigo-900 drop-shadow-sm">Level {gamification.level}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-1">Total Points</div>
                  <div className="text-xl font-black text-sky-800">{gamification.totalPoints} pts</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white rounded-full h-3 mt-4 overflow-hidden relative shadow-inner border border-sky-100">
                <div 
                  className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${(gamification.totalPoints % 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="text-[11px] font-bold text-indigo-400 mt-2 text-right">{100 - (gamification.totalPoints % 100)} pts to next level</div>
            </div>

            {/* SVG Badges Section */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">My Badges</h4>
              <div className="grid grid-cols-2 gap-3">
                
                {/* Perfect Scholar Badge */}
                <div className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all duration-300 ${gamification.badges.includes('perfect_score') ? 'border-amber-200 bg-amber-50/50 shadow-sm scale-100 hover:scale-105' : 'border-slate-100 bg-slate-50 opacity-60 grayscale'}`}>
                  <div className={`w-12 h-12 mb-2 rounded-full flex items-center justify-center ${gamification.badges.includes('perfect_score') ? 'bg-amber-100 shadow-inner' : 'bg-slate-200'}`}>
                    <svg className={`w-7 h-7 ${gamification.badges.includes('perfect_score') ? 'text-amber-500 drop-shadow-sm' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <div className="font-bold text-slate-700 text-xs leading-tight">Perfect<br/>Scholar</div>
                </div>

                {/* Quick Thinker Badge */}
                <div className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all duration-300 ${gamification.badges.includes('quick_thinker') ? 'border-indigo-200 bg-indigo-50/50 shadow-sm scale-100 hover:scale-105' : 'border-slate-100 bg-slate-50 opacity-60 grayscale'}`}>
                  <div className={`w-12 h-12 mb-2 rounded-full flex items-center justify-center ${gamification.badges.includes('quick_thinker') ? 'bg-indigo-100 shadow-inner' : 'bg-slate-200'}`}>
                    <svg className={`w-7 h-7 ${gamification.badges.includes('quick_thinker') ? 'text-indigo-500 drop-shadow-sm' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <div className="font-bold text-slate-700 text-xs leading-tight">Quick<br/>Thinker</div>
                </div>

              </div>
            </div>
          </div>

          {/* WEEKLY STREAK */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex-1">
            <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"></path></svg>
              My Weekly Streak
            </h3>

            <div className="flex flex-col gap-4">
              {stats.weeklyStreak.map((isDone, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 
                    ${isDone ? 'bg-emerald-100 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                  >
                    {isDone ? '✓' : ''}
                  </div>
                  <div className={`font-bold text-lg ${isDone ? 'text-slate-800' : 'text-slate-500'}`}>
                    {weekdays[index]}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;