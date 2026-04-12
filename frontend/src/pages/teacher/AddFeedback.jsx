import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function AddFeedback() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Modal States
  const [searchTerm, setSearchTerm] = useState("");
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

  // 2. Search Logic
  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    const searchString = (student.fullName || student.name || student.username || student.email || "").toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

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
      <div className="mb-10">
        <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight drop-shadow-sm">
          Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DB2777] to-[#9D174D]">Feedback</span> ⭐
        </h2>
        <p className="text-[#64748B] font-bold mt-2 text-lg">Select a student from the list or search their name to add feedback.</p>
      </div>

      {/* 🌟 SEARCH BAR */}
      <div className="bg-white p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-100 mb-8 flex items-center gap-4 transition-shadow focus-within:shadow-md focus-within:border-pink-300">
        <span className="text-2xl ml-2 opacity-50">🔍</span>
        <input 
          type="text" 
          placeholder="Search students by name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent outline-none font-bold text-[#1E293B] text-lg placeholder-slate-400"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")} 
            className="text-slate-400 hover:text-pink-500 font-bold text-xl mr-2"
          >
            ✕
          </button>
        )}
      </div>

      {/* 🌟 STUDENT LIST */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-6 min-h-[400px]">
        
        <h3 className="text-xl font-extrabold text-[#1E293B] mb-6 px-2 flex items-center gap-2">
          <span className="text-2xl">👨‍🎓</span> All Students ({filteredStudents.length})
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4"></div>
             <p className="font-bold text-slate-400 text-lg">Loading Students...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((student) => (
              <div 
                key={student._id} 
                className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-pink-50/50 rounded-2xl border border-transparent hover:border-pink-200 transition-all group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-5 overflow-hidden">
                  <div className="w-14 h-14 shrink-0 rounded-[1.2rem] bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600 flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-110 transition-transform">
                    {(student.fullName || student.username || 'S')[0].toUpperCase()}
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-[#0F172A] text-lg truncate">{student.fullName || student.username || "Student"}</h4>
                    <p className="text-[#94A3B8] font-semibold text-xs mt-0.5">ID: {student._id.substring(0,8)}</p>
                  </div>
                </div>
                
                {/* ADD FEEDBACK BUTTON */}
                <button 
                  onClick={() => openFeedbackModal(student)}
                  className="shrink-0 bg-white text-pink-600 border-2 border-pink-100 hover:bg-pink-500 hover:border-pink-500 hover:text-white font-bold px-5 py-3 rounded-xl shadow-sm transition-all flex items-center gap-2 active:scale-95"
                >
                  <span className="text-lg">⭐</span> 
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4 grayscale opacity-40">📭</div>
            <p className="font-bold text-slate-400 text-xl">No students found matching "{searchTerm}"</p>
            <button onClick={() => setSearchTerm("")} className="mt-4 text-pink-500 font-bold hover:underline">Clear Search</button>
          </div>
        )}
      </div>

      {/* 🌟 FEEDBACK MODAL (Pop-up) */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-300 border-4 border-white">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-pink-50 to-[#FCE7F3] p-8 flex justify-between items-center border-b border-pink-100">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-full bg-pink-500 text-white flex items-center justify-center font-black text-2xl shadow-inner">
                    {(selectedStudent.fullName || 'S')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#0F172A] leading-tight">
                      Feedback
                    </h3>
                    <p className="text-pink-600 font-bold text-sm">For {selectedStudent.fullName || 'Student'}</p>
                  </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-3xl text-slate-300 hover:text-rose-500 font-black transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-white">✕</button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 bg-[#F8FAFC]">
              
              {/* Date Selector */}
              <div>
                <label className="block text-[#64748B] font-extrabold text-sm uppercase tracking-wider mb-2">Feedback Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 font-bold text-[#1E293B] outline-none focus:border-pink-400 transition-colors shadow-sm"
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-[#64748B] font-extrabold text-sm uppercase tracking-wider mb-2">Performance Rating</label>
                <div className="flex gap-2 bg-white w-fit p-3 rounded-[1.5rem] border-2 border-slate-200 shadow-sm">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, stars: star})}
                      className={`text-4xl transition-all duration-300 hover:scale-110 drop-shadow-sm
                        ${formData.stars >= star ? 'grayscale-0' : 'grayscale opacity-20'}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[#64748B] font-extrabold text-sm uppercase tracking-wider mb-2">Encouraging Message</label>
                <textarea 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Write an encouraging message here..."
                  className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 font-bold text-[#1E293B] outline-none focus:border-pink-400 transition-colors h-32 resize-none shadow-sm"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-[#DB2777] text-white font-black text-xl py-4 rounded-2xl shadow-lg shadow-pink-200 hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
              >
                Save Feedback ✨
              </button>
            </form>
            
          </div>
        </div>
      )}

    </div>
  );
}

export default AddFeedback;