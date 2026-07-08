import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('Student');
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
    nextLesson: null
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
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName.charAt(0).toUpperCase() + storedName.slice(1));
    }

    const fetchDashboardStats = async () => {
      try {
        const studentId = localStorage.getItem('userId');
        if (!studentId) return;

        const response = await fetch(`http://localhost:5000/api/lessons/dashboard-stats/${studentId}`);
        const data = await response.json();

        if (data.success && data.progress) {
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

          let recentLessonObj = null;

          data.progress.forEach(p => {
            if (p.lessonId && !recentLessonObj) {
               recentLessonObj = {
                 id: p.lessonId._id,
                 title: p.lessonId.title,
                 partsDone: p.completedParts?.length || 0
               };
            }

            if (p.isQuizCompleted) {
              tQuizzes += 1;
              tCorrect += (p.correctAnswers || 0);

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
          });

          const finalScores = weeklyDataTemplate.map(day => ({
            day: day.name,
            score: day.count > 0 ? Math.round(day.Score / day.count) : 0
          }));

          setStats({
            totalStars: tCorrect,
            totalTrophies: tQuizzes,
            weeklyStreak: streak,
            weeklyScores: finalScores, 
            nextLesson: recentLessonObj
          });
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
          <h1 className="text-4xl md:text-5xl font-black text-slate-700 tracking-tight flex items-center gap-3">
            Hi, {userName}! 
            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
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
          <div className="bg-sky-50 rounded-[2rem] p-8 shadow-md border border-sky-100 relative overflow-hidden flex-1">
            <div className="absolute -right-10 -bottom-10 opacity-20">
              <svg className="w-64 h-64 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div className="relative z-10">
              <h2 className="text-sky-800 font-bold text-xl mb-2 opacity-90">YOUR NEXT MISSION</h2>
              
              {stats.nextLesson ? (
                <>
                  <h3 className="text-4xl font-black text-slate-800 mb-6 leading-tight">
                    {stats.nextLesson.title}
                  </h3>
                  <button 
                    onClick={() => navigate(`/lesson-view/${stats.nextLesson.id}`)}
                    className="bg-white text-sky-700 border border-sky-100 px-8 py-4 rounded-2xl font-black text-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-3 w-fit"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                    Continue Learning
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-4xl font-black text-slate-800 mb-6 leading-tight">
                    Start a New Adventure!
                  </h3>
                  <button 
                    onClick={() => navigate('/lessons')}
                    className="bg-white text-sky-700 border border-sky-100 px-8 py-4 rounded-2xl font-black text-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-3 w-fit"
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
          
          {/* MY ACHIEVEMENTS */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-slate-600 uppercase tracking-widest mb-6">My Rewards</h3>
            
            <div className="flex gap-4 w-full mb-6">
              <div className="flex-1 bg-[#FEF3C7] rounded-3xl p-6 border-2 border-[#FDE68A] flex flex-col items-center justify-center">
                <svg className="w-12 h-12 text-amber-500 mb-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                <div className="text-3xl font-black text-amber-700">{stats.totalStars}</div>
                <div className="text-sm font-bold text-amber-800 mt-1">Stars</div>
              </div>
              <div className="flex-1 bg-[#D1FAE5] rounded-3xl p-6 border-2 border-[#A7F3D0] flex flex-col items-center justify-center">
                <svg className="w-12 h-12 text-emerald-500 mb-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                <div className="text-3xl font-black text-emerald-700">{stats.totalTrophies}</div>
                <div className="text-sm font-bold text-emerald-800 mt-1">Trophies</div>
              </div>
            </div>
            <p className="text-slate-600 font-bold text-sm">You earn stars for correct answers!</p>
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