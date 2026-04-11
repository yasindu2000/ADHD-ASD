import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('Student');
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="min-h-screen bg-[#F4F8FB] flex items-center justify-center font-bold text-gray-500 text-2xl">Loading your space... 🌟</div>;

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="min-h-screen bg-[#F4F8FB] pb-12 px-4 md:px-8 font-sans">
      
      {/* 1. CALM & CLEAR HEADER */}
      <div className="max-w-5xl mx-auto pt-8 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1E3A8A] tracking-tight">
            Hi, {userName}! 👋
          </h1>
          <p className="text-[#64748B] font-bold mt-2 text-xl">{currentDateString}</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-white shadow-sm border-4 border-blue-100 flex items-center justify-center text-3xl">
          🧑‍🚀
        </div>
      </div>

      {/* 🌟 2. FEELINGS TRACKER (Moved to top, full width for balance) 🌟 */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">How are you feeling right now?</h3>
          <div className="flex flex-wrap gap-4">
            {['🤩', '😊', '🙂', '😐', '🥱', '😟'].map((emoji, index) => {
              const isSelected = selectedFeeling === index;
              const hasSelection = selectedFeeling !== null;
              return (
                <button
                  key={index} onClick={() => setSelectedFeeling(index)}
                  className={`text-5xl cursor-pointer transition-all duration-300 p-4 rounded-3xl
                    ${isSelected ? 'bg-blue-50 border-4 border-blue-400 scale-110 shadow-md' : 'bg-gray-50 border-4 border-transparent hover:scale-105 hover:bg-gray-100'} 
                    ${hasSelection && !isSelected ? 'opacity-40 grayscale-[50%]' : 'opacity-100'}
                  `}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
          {selectedFeeling !== null && (
            <div className="mt-6 text-blue-600 font-bold text-lg animate-in fade-in">
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
          <div className="bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] rounded-[2rem] p-8 shadow-md relative overflow-hidden flex-1">
            <div className="absolute -right-10 -bottom-10 text-9xl opacity-20">🎯</div>
            <div className="relative z-10">
              <h2 className="text-white font-bold text-xl mb-2 opacity-90">YOUR NEXT MISSION</h2>
              
              {stats.nextLesson ? (
                <>
                  <h3 className="text-4xl font-black text-white mb-6 leading-tight">
                    {stats.nextLesson.title}
                  </h3>
                  <button 
                    onClick={() => navigate(`/lesson-view/${stats.nextLesson.id}`)}
                    className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-3 w-fit"
                  >
                    ▶ Continue Learning
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-4xl font-black text-white mb-6 leading-tight">
                    Start a New Adventure!
                  </h3>
                  <button 
                    onClick={() => navigate('/lessons')}
                    className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-3 w-fit"
                  >
                    📚 Open Library
                  </button>
                </>
              )}
            </div>
          </div>

          {/* SIMPLE DAILY SCORE CHART */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📊 My Daily Scores
            </h3>
            
            <div className="flex justify-between items-end h-40 gap-2">
              {stats.weeklyScores.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-end h-full w-full group">
                  <span className={`text-sm font-black mb-1 ${item.score > 0 ? 'text-blue-600' : 'text-transparent'}`}>
                    {item.score}%
                  </span>
                  
                  <div className="w-full max-w-[40px] bg-blue-50 rounded-t-xl relative h-[120px] flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-1000 ease-out ${item.score === 100 ? 'bg-green-400' : 'bg-blue-400'}`}
                      style={{ height: `${item.score}%` }}
                    ></div>
                  </div>
                  
                  <span className="text-sm font-bold text-gray-500 mt-2">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Rewards + Weekly Streak) */}
        <div className="md:col-span-5 flex flex-col gap-8">
          
          {/* MY ACHIEVEMENTS */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-6">My Rewards</h3>
            
            <div className="flex gap-4 w-full mb-6">
              <div className="flex-1 bg-[#FEF3C7] rounded-3xl p-6 border-2 border-[#FDE68A]">
                <div className="text-4xl mb-2">⭐</div>
                <div className="text-3xl font-black text-yellow-600">{stats.totalStars}</div>
                <div className="text-sm font-bold text-yellow-700 mt-1">Stars</div>
              </div>
              <div className="flex-1 bg-[#D1FAE5] rounded-3xl p-6 border-2 border-[#A7F3D0]">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-3xl font-black text-green-600">{stats.totalTrophies}</div>
                <div className="text-sm font-bold text-green-700 mt-1">Trophies</div>
              </div>
            </div>
            <p className="text-gray-500 font-bold text-sm">You earn stars for correct answers!</p>
          </div>

          {/* WEEKLY STREAK */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🔥 My Weekly Streak
            </h3>
            
            <div className="flex flex-col gap-4">
              {stats.weeklyStreak.map((isDone, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 
                    ${isDone ? 'bg-green-500 border-green-500 text-white shadow-sm' : 'bg-gray-100 border-gray-200 text-gray-300'}`}
                  >
                    {isDone ? '✓' : ''}
                  </div>
                  <div className={`font-bold text-lg ${isDone ? 'text-gray-800' : 'text-gray-400'}`}>
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