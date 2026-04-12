import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View Table States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // 1. පිටුවට ආපු ගමන් ළමයි ලිස්ට් එක ගන්නවා
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

  // 2. View Button එක එබුවම ළමයාගේ Progress එක ගන්නවා
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

  // 3. Back Button එක එබුවම ආයේ ලිස්ට් එකට යනවා
  const handleBack = () => {
    setSelectedStudent(null);
    setProgressData([]);
  };

  return (
    <div className="font-sans min-h-full">
      
      {/* 🌟 තෝරපු ළමයෙක් නැත්නම් ලිස්ට් එක පෙන්නනවා (STUDENT LIST VIEW) */}
      {!selectedStudent ? (
        <>
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight drop-shadow-sm">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Students</span> 👥
            </h2>
            <p className="text-[#64748B] font-bold mt-2 text-lg">Manage your students and view their progress.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 min-h-[400px]">
            {loading ? (
              <p className="text-center font-bold text-slate-400 mt-10 text-xl animate-pulse">Loading Students... 🔄</p>
            ) : students.length > 0 ? (
              <div className="flex flex-col gap-4">
                {students.map((student) => (
                  <div 
                    key={student._id} 
                    className="flex items-center justify-between p-5 bg-slate-50 hover:bg-blue-50/50 rounded-2xl border border-transparent hover:border-blue-100 transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-110 transition-transform">
                        {(student.fullName || student.username || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        {/* Left Side: Student Name */}
                        <h4 className="font-bold text-[#0F172A] text-xl">{student.fullName || student.username || "Student Name"}</h4>
                        <p className="text-[#64748B] font-semibold text-sm">ID: {student._id.substring(0,8)}</p>
                      </div>
                    </div>
                    
                    {/* Right Side: View Button */}
                    <button 
                      onClick={() => handleViewStudent(student)}
                      className="bg-white text-blue-600 border-2 border-blue-100 hover:bg-blue-600 hover:text-white font-bold px-8 py-3 rounded-xl shadow-sm transition-all active:scale-95"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                 <div className="text-6xl mb-4 grayscale opacity-40">📭</div>
                 <p className="font-bold text-slate-400 text-xl">No students found.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        
        /* 🌟 ළමයෙක් තේරුවම පේන විස්තරය (TABLE VIEW - LIKE SCREENSHOT) */
        <div className="animate-in slide-in-from-right-8 duration-300">
          
          {/* <- Back Button */}
          <button 
            onClick={handleBack}
            className="flex items-center gap-3 text-3xl font-black text-black hover:text-blue-600 transition-colors mb-10"
          >
            <span className="text-4xl">←</span> Back
          </button>

          {/* Student Name */}
          <h2 className="text-5xl font-black text-black mb-8 ml-2">
            {selectedStudent.fullName || selectedStudent.username || "Student Name"}
          </h2>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden ml-2">
            
            {loadingProgress ? (
              <p className="text-center font-bold text-slate-400 py-20 text-xl animate-pulse">Loading Progress... 🔄</p>
            ) : (
              <table className="w-full text-center border-collapse">
                {/* Table Head */}
                <thead>
                  <tr className="bg-white border-b border-gray-300">
                    <th className="py-5 px-4 font-extrabold text-black text-lg border-r border-gray-300">Date</th>
                    <th className="py-5 px-4 font-extrabold text-black text-lg border-r border-gray-300">Daily Lessons</th>
                    <th className="py-5 px-4 font-extrabold text-black text-lg border-r border-gray-300">Quiz</th>
                    <th className="py-5 px-4 font-extrabold text-black text-lg border-r border-gray-300">Quiz Score</th>
                    <th className="py-5 px-4 font-extrabold text-black text-lg">Quiz Time</th>
                  </tr>
                </thead>
                
                {/* Table Body */}
                <tbody>
                  {progressData.length > 0 ? progressData.map((row, index) => (
                    <tr key={row.id || index} className="border-b border-gray-300 last:border-b-0 hover:bg-slate-50 transition-colors">
                      {/* Date */}
                      <td className="py-5 px-4 font-medium text-black text-lg border-r border-gray-300">
                        {row.date}
                      </td>
                      
                      {/* Daily Lessons Badge */}
                      <td className="py-5 px-4 border-r border-gray-300">
                        <span className={`px-4 py-1.5 rounded-full text-white font-bold text-sm shadow-sm
                          ${row.lessonStatus === 'Completed' ? 'bg-[#00E676]' : 'bg-[#FF3D00]'}`}
                        >
                          {row.lessonStatus}
                        </span>
                      </td>
                      
                      {/* Quiz Badge */}
                      <td className="py-5 px-4 border-r border-gray-300">
                        <span className={`px-4 py-1.5 rounded-full text-white font-bold text-sm shadow-sm
                          ${row.quizStatus === 'Completed' ? 'bg-[#00E676]' : 'bg-[#FF3D00]'}`}
                        >
                          {row.quizStatus}
                        </span>
                      </td>
                      
                      {/* Quiz Score */}
                      <td className="py-5 px-4 font-medium text-black text-lg border-r border-gray-300">
                        {row.quizScore}
                      </td>
                      
                      {/* Quiz Time */}
                      <td className="py-5 px-4 font-medium text-black text-lg">
                        {row.quizTime}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-gray-400 font-bold text-lg">
                        No progress records found for this student yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Students;