import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View Table States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/teacher/students');
        const data = await res.json();
        if (data.success) {
          setStudents(data.students);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // 2. View Button 
  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setLoadingProgress(true);
    try {
      const res = await fetch(`http://localhost:5000/api/teacher/student-progress/${student._id}`);
      const data = await res.json();
      if (data.success) {
        setProgressData(data.progress);
      } else {
        toast.error("Failed to load student progress");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error!");
    } finally {
      setLoadingProgress(false);
    }
  };

  // 3. Back Button 
  const handleBack = () => {
    setSelectedStudent(null);
    setProgressData([]);
  };

  return (
    <div className="font-sans min-h-full">
      
     
      {!selectedStudent ? (
        <div className="max-w-5xl mx-auto py-10 px-4">
          <div className="mb-12 flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-black tracking-tight drop-shadow-sm">
                My Students
              </h2>
              <p className="text-slate-500 font-bold mt-2 text-lg">Manage your students and view their progress.</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white p-10 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-blue-500 gap-4">
                <svg className="animate-spin h-10 w-10" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="font-bold text-lg animate-pulse">Loading Students...</p>
              </div>
            ) : students.length > 0 ? (
              <div className="flex flex-col gap-6">
                {students.map((student) => (
                  <div 
                    key={student._id} 
                    className="flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white rounded-[2rem] border border-slate-100 hover:border-blue-100 transition-all duration-300 group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-black text-3xl shadow-inner group-hover:scale-105 transition-transform duration-300 border border-white">
                        {(student.fullName || student.username || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-2xl tracking-tight group-hover:text-blue-600 transition-colors">{student.fullName || student.username || "Student Name"}</h4>
                        <p className="text-slate-500 font-bold text-sm tracking-widest uppercase mt-1">ID: {student._id.substring(0,8)}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleViewStudent(student)}
                      className="bg-white text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-bold px-8 py-3.5 rounded-2xl shadow-sm hover:shadow-blue-500/30 transition-all flex items-center gap-2 group/btn"
                    >
                      View Profile
                      <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                 <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6 shadow-inner">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                 </div>
                 <p className="font-black text-slate-600 text-2xl mb-2">No students found.</p>
                 <p className="font-semibold text-slate-400">Students will appear here once they register.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        
       
        <div className="max-w-6xl mx-auto py-10 px-4 animate-in slide-in-from-right-8 duration-500">
          
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-extrabold text-slate-500 hover:text-blue-600 transition-all mb-8 uppercase tracking-widest bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 w-fit px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> 
            Back to Students
          </button>

          <div className="flex items-center gap-6 mb-10 bg-white/50 backdrop-blur-sm p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-4xl shadow-inner border-4 border-white">
              {(selectedStudent.fullName || selectedStudent.username || 'S')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-extrabold uppercase tracking-widest text-blue-500 mb-1">Student Profile</p>
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
                {selectedStudent.fullName || selectedStudent.username || "Student Name"}
              </h2>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
            
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                Progress Tracking
              </h3>
            </div>

            {loadingProgress ? (
              <div className="flex flex-col items-center justify-center py-32 text-blue-500 gap-4">
                <svg className="animate-spin h-10 w-10" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="font-bold text-lg animate-pulse">Loading Progress Data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <th className="py-5 px-6 font-extrabold text-slate-500 text-sm uppercase tracking-wider text-left pl-8">Date</th>
                      <th className="py-5 px-6 font-extrabold text-slate-500 text-sm uppercase tracking-wider">Lessons</th>
                      <th className="py-5 px-6 font-extrabold text-slate-500 text-sm uppercase tracking-wider">Quiz</th>
                      <th className="py-5 px-6 font-extrabold text-slate-500 text-sm uppercase tracking-wider">Quiz Score</th>
                      <th className="py-5 px-6 font-extrabold text-slate-500 text-sm uppercase tracking-wider text-right pr-8">Time Taken</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-100">
                    {progressData.length > 0 ? progressData.map((row, index) => (
                      <tr key={row.id || index} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-6 px-6 font-bold text-slate-800 text-left pl-8">
                          {row.date}
                        </td>
                        
                        <td className="py-6 px-6">
                          <span className={`px-4 py-2 rounded-xl font-bold text-sm tracking-wide shadow-sm inline-flex items-center justify-center gap-1.5
                            ${row.lessonStatus === 'Completed' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20' : 'bg-rose-50 text-rose-600 ring-1 ring-rose-500/20'}`}
                          >
                            {row.lessonStatus === 'Completed' ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg> : null}
                            {row.lessonStatus}
                          </span>
                        </td>
                        
                        <td className="py-6 px-6">
                          <span className={`px-4 py-2 rounded-xl font-bold text-sm tracking-wide shadow-sm inline-flex items-center justify-center gap-1.5
                            ${row.quizStatus === 'Completed' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20' : 'bg-rose-50 text-rose-600 ring-1 ring-rose-500/20'}`}
                          >
                            {row.quizStatus === 'Completed' ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg> : null}
                            {row.quizStatus}
                          </span>
                        </td>
                        
                        <td className="py-6 px-6 font-black text-slate-700 text-lg">
                          {row.quizScore}
                        </td>
                        
                        <td className="py-6 px-6 font-bold text-slate-500 text-right pr-8 flex items-center justify-end gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {row.quizTime}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="py-24 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            </div>
                            <p className="font-bold text-lg text-slate-500">No progress records found for this student yet.</p>
                            <p className="text-sm mt-1">Data will appear here once they complete lessons or quizzes.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Students;