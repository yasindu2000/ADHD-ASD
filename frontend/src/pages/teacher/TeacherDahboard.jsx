import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacherName, setTeacherName] = useState('Teacher');
  const [loading, setLoading] = useState(true);

  // Dynamic States for DB Data
  const [stats, setStats] = useState({ totalStudents: 0, totalLessons: 0, totalQuizzes: 0 });
  const [activities, setActivities] = useState([]);

  // Chart Data States
  const [lessonChartData, setLessonChartData] = useState([]);
  const [quizChartData, setQuizChartData] = useState([]);

  const today = new Date();
  const currentDateString = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setTeacherName(storedName.charAt(0).toUpperCase() + storedName.slice(1));

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/teacher/dashboard-stats');
        const data = await response.json();

        if (data.success) {
          setStats(data.stats);
          setActivities(data.recentActivity || []);
          setLessonChartData(data.lessonChart || []);
          setQuizChartData(data.quizChart || []);
        }
      } catch (error) {
        console.error("Error fetching dynamic stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-bold text-[#64748B] text-2xl animate-pulse">Syncing Classroom Data... 🔄</div>;

  return (
    <div className="min-h-screen bg-[#F0F5FA] font-sans pb-12 pt-2 selection:bg-indigo-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 🌟 1. PREMIUM HEADER */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        `}</style>

        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold text-slate-800 tracking-tight drop-shadow-sm flex items-center">
              Hello, <span className="text-black ml-3">{teacherName}</span>!
              <svg className="w-10 h-10 md:w-12 md:h-12 inline-block text-amber-400 ml-3 hover:rotate-12 transition-transform duration-300" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path>
              </svg>
            </h2>
            <p className="text-slate-500 font-medium mt-2 text-lg tracking-wide flex items-center gap-2">
              <span>{currentDateString}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="text-emerald-500 font-semibold flex items-center gap-1"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> Live Updates</span>
            </p>
          </div>
          <div className="flex flex-col items-end justify-center">
            <div className="text-4xl font-light text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 tracking-wider drop-shadow-sm">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).split(' ')[0]}
              <span className="text-2xl ml-1.5 font-medium">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).split(' ')[1]}</span>
            </div>
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em] mt-1.5">
              Live Time
            </div>
          </div>
        </div>

        {/* 🌟 2. PREMIUM STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-8 rounded-[2.5rem] shadow-lg shadow-indigo-300/40 border border-indigo-300 flex items-center justify-between group hover:-translate-y-2 transition-all duration-300">
            <div>
              <p className="text-indigo-800 font-extrabold text-sm uppercase tracking-[0.15em] mb-2 drop-shadow-sm">Total Students</p>
              <h3 className="text-5xl font-black text-slate-800">{stats.totalStudents}</h3>
            </div>
            <div className="w-20 h-20 rounded-[1.5rem] bg-white/50 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 border border-white/60 shadow-sm">
              <svg className="w-10 h-10 text-indigo-600 drop-shadow-sm" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"></path>
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-100 to-teal-200 p-8 rounded-[2.5rem] shadow-lg shadow-emerald-300/40 border border-emerald-300 flex items-center justify-between group hover:-translate-y-2 transition-all duration-300">
            <div>
              <p className="text-teal-800 font-extrabold text-sm uppercase tracking-[0.15em] mb-2 drop-shadow-sm">Active Lessons</p>
              <h3 className="text-5xl font-black text-slate-800">{stats.totalLessons}</h3>
            </div>
            <div className="w-20 h-20 rounded-[1.5rem] bg-white/50 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 border border-white/60 shadow-sm">
              <svg className="w-10 h-10 text-teal-600 drop-shadow-sm" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zM21 18.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"></path>
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-100 to-fuchsia-200 p-8 rounded-[2.5rem] shadow-lg shadow-purple-300/40 border border-purple-300 flex items-center justify-between group hover:-translate-y-2 transition-all duration-300">
            <div>
              <p className="text-fuchsia-800 font-extrabold text-sm uppercase tracking-[0.15em] mb-2 drop-shadow-sm">Total Quizzes</p>
              <h3 className="text-5xl font-black text-slate-800">{stats.totalQuizzes}</h3>
            </div>
            <div className="w-20 h-20 rounded-[1.5rem] bg-white/50 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 border border-white/60 shadow-sm">
              <svg className="w-10 h-10 text-fuchsia-600 drop-shadow-sm" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* 🌟 3. ANALYTICS CHARTS (Glassmorphism) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

          {/* Chart 1: Bar Chart */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                <span className="bg-indigo-50 text-indigo-600 p-2.5 rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center">
                  <svg className="w-6 h-6" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"></path>
                  </svg>
                </span>
                Lesson Views
              </h3>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">This Week</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lessonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontWeight: 'bold' }} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', fontWeight: 'bold', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="views" fill="url(#colorViews)" radius={[12, 12, 0, 0]} barSize={40} />
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#A5B4FC" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Line Chart */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                <span className="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center">
                  <svg className="w-6 h-6" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"></path>
                  </svg>
                </span>
                Average Score
              </h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">This Week</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quizChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontWeight: 'bold' }} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', fontWeight: 'bold', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={6} dot={{ r: 6, fill: "#fff", strokeWidth: 3, stroke: "#10B981" }} activeDot={{ r: 10, strokeWidth: 0, fill: "#059669" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 🌟 4. RECENT ACTIVITY (Modern List) */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div className="p-8 md:px-10 md:py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-4">
              <span className="bg-orange-50 text-orange-500 p-2.5 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-center">
                <svg className="w-6 h-6" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8z"></path>
                </svg>
              </span> 
              Recent Activity
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">View All</span>
          </div>

          <div className="p-6 md:p-8">
            {activities.length > 0 ? (
              <div className="flex flex-col gap-4">
                {activities.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 bg-white hover:bg-slate-50/80 rounded-2xl transition-all duration-300 border border-slate-50 hover:border-slate-200 hover:shadow-md group">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl ${act.color || 'bg-blue-50 text-blue-600'} flex items-center justify-center text-2xl border border-white shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                        {(() => {
                          const actionText = (act.action || '').toLowerCase();
                          const iconText = act.icon || '';
                          
                          if (iconText.includes('🎮') || actionText.includes('game')) {
                            return (
                              <svg className="w-7 h-7 drop-shadow-sm" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21.58 16.09l-1.09-7.66C20.18 6.27 18.4 5 16.32 5H7.68C5.6 5 3.82 6.27 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.13.75 1.8.75 1.56 0 2.75-1.37 2.53-2.91zM8 11H6v2H5v-2H3v-1h2V8h1v2h2v1zm7.5 3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 8 18.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path>
                              </svg>
                            );
                          }
                          if (iconText.includes('📚') || iconText.includes('📖') || actionText.includes('lesson')) {
                            return (
                              <svg className="w-7 h-7 drop-shadow-sm" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zM21 18.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"></path>
                              </svg>
                            );
                          }
                          if (iconText.includes('🏆') || iconText.includes('🏅') || actionText.includes('quiz')) {
                            return (
                              <svg className="w-7 h-7 drop-shadow-sm" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"></path>
                              </svg>
                            );
                          }
                          return (
                            <svg className="w-7 h-7 drop-shadow-sm" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path>
                            </svg>
                          );
                        })()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{act.name}</h4>
                        <p className="text-slate-500 text-sm font-medium mt-0.5">{act.action}</p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-indigo-500 bg-indigo-50 p-2 rounded-xl text-sm font-bold">Review</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner mb-6">
                  <svg className="w-12 h-12 text-slate-300 drop-shadow-sm" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4.99c0 1.1-.9 2-2 2s-2-.9-2-2H5V5h14v10z"></path>
                  </svg>
                </div>
                <h4 className="text-slate-700 font-extrabold text-xl mb-1">No Recent Activity</h4>
                <p className="text-slate-400 font-medium max-w-sm">When students interact with lessons or complete quizzes, those events will automatically appear here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default TeacherDashboard;