import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function PrincipalDashboard() {
  const [data, setData] = useState({
    stats: { totalStudents: 0, totalTeachers: 0 },
    teachers: [],
    students: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/principal/dashboard-stats', {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      if (result.success) {
        setData({
          stats: result.stats,
          teachers: result.teachers,
          students: result.students
        });
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-bold text-indigo-500 text-2xl animate-pulse">
        <svg className="animate-spin h-8 w-8 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading School Data...
      </div>
    );
  }

  return (
    <div className="font-sans">
      
      {/* HEADER SECTION */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
          School <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Overview</span>
        </h1>
        <p className="text-slate-500 font-bold mt-2 text-lg">
          Monitor overall student performance and teacher details.
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Total Students</p>
            <h3 className="text-4xl font-black text-slate-800">{data.stats.totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Total Teachers</p>
            <h3 className="text-4xl font-black text-slate-800">{data.stats.totalTeachers}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* STUDENTS PERFORMANCE TABLE */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800">Student Performance (Marks)</h2>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
              {data.students.length} Students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-100 text-slate-400 uppercase text-xs tracking-wider">
                  <th className="pb-4 font-bold">Student Name</th>
                  <th className="pb-4 font-bold text-center">Lessons Completed</th>
                  <th className="pb-4 font-bold text-center">Quizzes Taken</th>
                  <th className="pb-4 font-bold text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4">
                      <div className="font-bold text-slate-700">{student.fullName}</div>
                      <div className="text-xs text-slate-400 font-medium">{student.grade || 'No Grade'}</div>
                    </td>
                    <td className="py-4 text-center font-bold text-slate-600">
                      {student.completedLessons}
                    </td>
                    <td className="py-4 text-center font-bold text-slate-600">
                      {student.quizzesTaken}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`inline-block px-3 py-1 rounded-xl text-sm font-bold
                        ${student.averageScore >= 75 ? 'bg-emerald-50 text-emerald-600' : 
                          student.averageScore >= 50 ? 'bg-amber-50 text-amber-600' : 
                          'bg-red-50 text-red-600'}`}
                      >
                        {student.averageScore}%
                      </span>
                    </td>
                  </tr>
                ))}
                {data.students.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 font-bold">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TEACHERS LIST TABLE */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800">Teacher Directory</h2>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
              {data.teachers.length} Teachers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-100 text-slate-400 uppercase text-xs tracking-wider">
                  <th className="pb-4 font-bold">Teacher Name</th>
                  <th className="pb-4 font-bold">Email Address</th>
                  <th className="pb-4 font-bold text-right">Phone Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 font-bold text-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500 uppercase">
                          {teacher.fullName.charAt(0)}
                        </div>
                        {teacher.fullName}
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 font-medium">
                      {teacher.email}
                    </td>
                    <td className="py-4 text-right font-mono text-slate-600 font-bold">
                      {teacher.phone || 'N/A'}
                    </td>
                  </tr>
                ))}
                {data.teachers.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-400 font-bold">
                      No teachers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PrincipalDashboard;
