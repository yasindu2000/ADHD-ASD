import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function AddFeedback() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Modal States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form States (Date, Message, Stars)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Default අද දවස
    message: "",
    stars: 5
  });

  // 1. Fetch all students when page loads
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

  // 2. Search & Filter Logic
  const staticGrades = ['1', '2', '3', '4', '5'];
  
  const filteredStudents = students.filter(student => {
    let matchesSearch = true;
    if (searchTerm) {
      const searchString = (student.fullName || student.name || student.username || student.email || "").toLowerCase();
      matchesSearch = searchString.includes(searchTerm.toLowerCase());
    }
    
    const matchesGrade = selectedGrade === '' || String(student.grade) === selectedGrade;
    
    return matchesSearch && matchesGrade;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedGrade("");
  };

  // 3. Open Modal for a specific student
  const openFeedbackModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      message: "",
      stars: 5
    });
    setIsModalOpen(true);
  };

  // 4. Submit and Save to Database
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      toast.error("Please write a feedback message!");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/feedback/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          message: formData.message,
          stars: formData.stars,
          date: formData.date
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Feedback sent to ${selectedStudent.fullName || 'Student'}! 🌟`);
        setIsModalOpen(false); 
      } else {
        toast.error("Failed to send feedback.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error while saving!");
    }
  };

  return (
    <div className="font-sans min-h-full">
      
      {/* 🌟 HEADER */}
      <div className="max-w-5xl mx-auto py-10 px-4">
        <div className="mb-12 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tight drop-shadow-sm">
              Student Feedback
            </h2>
            <p className="text-slate-500 font-bold mt-2 text-lg">Select a student from the list or search their name to add feedback.</p>
          </div>
        </div>

        {/* 🌟 SEARCH BAR AND FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-4 transition-all focus-within:shadow-md focus-within:border-blue-300 flex-1">
            <svg className="w-7 h-7 text-slate-400 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search students by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none font-bold text-slate-800 text-lg placeholder-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")} 
                className="text-slate-400 hover:text-blue-500 transition-colors mr-2 p-1 rounded-full hover:bg-blue-50"
                title="Clear search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <select
              className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200 focus:outline-none focus:border-blue-300 font-bold text-slate-700 min-w-[150px]"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="">All Grades</option>
              {staticGrades.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
            <button
              onClick={resetFilters}
              className="px-6 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-[2rem] shadow-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap border border-slate-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Reset
            </button>
          </div>
        </div>

        {/* 🌟 STUDENT LIST */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white p-10 min-h-[400px]">
          
          <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
            <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            All Students ({filteredStudents.length})
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-blue-500 gap-4">
              <svg className="animate-spin h-10 w-10" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p className="font-bold text-lg animate-pulse">Loading Students...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredStudents.map((student) => (
                <div 
                  key={student._id} 
                  className="flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white rounded-[2rem] border border-slate-100 hover:border-blue-100 transition-all duration-300 group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-5 overflow-hidden">
                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-black text-3xl shadow-inner group-hover:scale-105 transition-transform duration-300 border border-white">
                      {(student.fullName || student.username || 'S')[0].toUpperCase()}
                    </div>
                    <div className="truncate pr-4">
                      <h4 className="font-bold text-slate-800 text-xl truncate group-hover:text-blue-600 transition-colors">{student.fullName || student.username || "Student"}</h4>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">ID: {student._id.substring(0,8)}</p>
                    </div>
                  </div>
                  
                  {/* ADD FEEDBACK BUTTON */}
                  <button 
                    onClick={() => openFeedbackModal(student)}
                    className="shrink-0 bg-white text-blue-600 border border-blue-100 hover:bg-blue-600 hover:border-blue-600 hover:text-white font-bold px-6 py-3.5 rounded-2xl shadow-sm transition-all flex items-center gap-2 group/btn"
                  >
                    <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6 shadow-inner">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <p className="font-bold text-slate-600 text-xl">No students found matching "{searchTerm}"</p>
              <button onClick={() => setSearchTerm("")} className="mt-4 text-blue-500 font-bold hover:underline">Clear Search</button>
            </div>
          )}
        </div>
      </div>

      {/* 🌟 FEEDBACK MODAL (Pop-up) */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300 border-4 border-white">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-8 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center gap-5">
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-inner">
                    {(selectedStudent.fullName || 'S')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 leading-tight">
                      Feedback
                    </h3>
                    <p className="text-blue-600 font-bold text-sm tracking-wide uppercase mt-1">For {selectedStudent.fullName || 'Student'}</p>
                  </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-red-500 transition-colors w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-8 bg-white">
              
              {/* Date Selector */}
              <div>
                <label className="block text-slate-500 font-extrabold text-xs uppercase tracking-widest mb-3">Feedback Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm cursor-pointer"
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-slate-500 font-extrabold text-xs uppercase tracking-widest mb-3">Performance Rating</label>
                <div className="flex gap-3 bg-slate-50/50 w-fit p-4 rounded-2xl border border-slate-200 shadow-sm">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, stars: star})}
                      className={`transition-all duration-300 hover:scale-110 drop-shadow-sm focus:outline-none
                        ${formData.stars >= star ? 'text-amber-400' : 'text-slate-200'}`}
                    >
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-slate-500 font-extrabold text-xs uppercase tracking-widest mb-3">Encouraging Message</label>
                <textarea 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Write an encouraging message here..."
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-5 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-36 resize-none shadow-sm placeholder-slate-400"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xl py-4 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl active:scale-95 transition-all mt-4 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                Save Feedback
              </button>
            </form>
            
          </div>
        </div>
      )}

    </div>
  );
}

export default AddFeedback;