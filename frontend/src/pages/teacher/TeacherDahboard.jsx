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
    <div className="min-h-screen bg-[#F0F5FA] font-sans pb-12 pt-8 selection:bg-indigo-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 🌟 1. PREMIUM HEADER */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight drop-shadow-sm">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{teacherName}</span>! 👋
            </h2>
            <p className="text-[#64748B] font-bold mt-2 text-lg tracking-wide flex items-center gap-2">
              <span>{currentDateString}</span> 
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> 
              <span className="text-emerald-500 flex items-center gap-1"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> Live Updates</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={() => navigate('/teacher/feedback')}
              className="bg-white hover:bg-slate-50 text-[#1E293B] border border-slate-200 font-bold px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            >
              ⭐ Give Feedback
            </button>
            <div className="w-16 h-16 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-4 border-white flex items-center justify-center text-3xl hover:scale-105 transition-transform duration-300 cursor-pointer">
              👩‍🏫
            </div>
          </div>
        </div>

        {/* 🌟 2. PREMIUM STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
            <div>
              <p className="text-[#94A3B8] font-extrabold text-sm uppercase tracking-[0.15em] mb-2">Total Students</p>
              <h3 className="text-5xl font-black text-[#1E293B]">{stats.totalStudents}</h3>
            </div>
            <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300 border border-blue-100 shadow-inner">
              👨‍🎓
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
            <div>
              <p className="text-[#94A3B8] font-extrabold text-sm uppercase tracking-[0.15em] mb-2">Active Lessons</p>
              <h3 className="text-5xl font-black text-[#1E293B]">{stats.totalLessons}</h3>
            </div>
            <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300 border border-emerald-100 shadow-inner">
              📚
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
            <div>
              <p className="text-[#94A3B8] font-extrabold text-sm uppercase tracking-[0.15em] mb-2">Total Quizzes</p>
              <h3 className="text-5xl font-black text-[#1E293B]">{stats.totalQuizzes}</h3>
            </div>
            <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-purple-50 to-purple-100/50 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300 border border-purple-100 shadow-inner">
              🏆
            </div>
          </div>
        </div>

        {/* 🌟 3. ANALYTICS CHARTS (Glassmorphism) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Chart 1: Bar Chart */}
          <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-extrabold text-[#1E293B] flex items-center gap-3">
                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">📈</span> Lesson Views 
              </h3>
              <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">This Week</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lessonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontWeight: 'bold'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontWeight: 'bold'}} />
                  <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '16px', fontWeight: 'bold', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="views" fill="url(#colorViews)" radius={[8, 8, 0, 0]} barSize={40} />
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#818CF8" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Line Chart */}
          <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
             <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-extrabold text-[#1E293B] flex items-center gap-3">
                <span className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">🎯</span> Average Score 
              </h3>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">This Week</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quizChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontWeight: 'bold'}} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontWeight: 'bold'}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', fontWeight: 'bold', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={5} dot={{ r: 6, fill: "#10B981", strokeWidth: 3, stroke: "#fff" }} activeDot={{ r: 9, strokeWidth: 0, fill: "#059669" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 🌟 4. RECENT ACTIVITY (Modern List) */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden">
          <div className="p-8 md:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-2xl font-extrabold text-[#1E293B] flex items-center gap-3">
               <span className="text-2xl">⚡</span> Recent Activity
            </h3>
          </div>
          
          <div className="p-6 md:p-8">
            {activities.length > 0 ? (
              <div className="flex flex-col gap-4">
                {activities.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 hover:bg-slate-50 rounded-2xl transition-all duration-300 border border-transparent hover:border-slate-100 group">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl ${act.color || 'bg-blue-100 text-blue-600'} flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform`}>
                        {act.icon || '📌'}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0F172A] text-lg">{act.name}</h4>
                        <p className="text-[#64748B] text-sm font-medium">{act.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                 <div className="text-6xl mb-4 opacity-50 grayscale">📭</div>
                 <p className="text-[#94A3B8] font-bold text-lg">No recent activity recorded yet.</p>
                 <p className="text-slate-400 text-sm mt-1">When students complete lessons, they'll appear here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default TeacherDashboard;