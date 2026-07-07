import React, { useState, useEffect } from 'react';

function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyFeedbacks = async () => {
      try {
        const studentId = localStorage.getItem('userId');
        if (!studentId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:5000/api/feedback/student/${studentId}`);
        const data = await res.json();

        if (data.success) {
          setFeedbacks(data.feedbacks);
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyFeedbacks();
  }, []);

 
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center font-bold text-slate-500 text-2xl animate-pulse py-20">
        Opening your feedback letters... 💌
      </div>
    );
  }

  return (
    <div className="font-sans pb-12 selection:bg-sky-100">
      <div className="max-w-5xl mx-auto pt-8">
        
        {/* 🌟 HEADER */}
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-700 tracking-tight drop-shadow-sm">
              My <span className="text-slate-700">Feedback</span> 🌟
            </h2>
            <p className="text-slate-500 font-bold mt-3 text-lg tracking-wide">
              See what your teachers have to say about your great work!
            </p>
          </div>
          <div className="hidden md:flex w-20 h-20 rounded-full bg-white shadow-sm border border-slate-100 items-center justify-center text-4xl hover:scale-105 transition-transform duration-300 transform rotate-12">
            💌
          </div>
        </div>

        {/* 🌟 FEEDBACK CARDS GRID */}
        {feedbacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {feedbacks.map((item, index) => (
              <div 
                key={item._id || index} 
                className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border-2 border-white hover:-translate-y-2 hover:shadow-md transition-all duration-300 group"
              >
                {/* Card Header (Date & Stars) */}
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                      📅
                    </div>
                    <div>
                      <p className="text-slate-400 font-extrabold text-xs uppercase tracking-widest mb-1">Received on</p>
                      <h4 className="font-bold text-slate-700 text-lg">{formatDate(item.date)}</h4>
                    </div>
                  </div>
                  
                  {/* Stars Display */}
                  <div className="bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-xl ${i < item.stars ? 'grayscale-0' : 'grayscale opacity-30'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>

                {/* Message Body */}
                <div className="relative">
                  <span className="absolute -top-4 -left-2 text-4xl text-slate-200 font-serif">"</span>
                  <p className="text-slate-600 font-bold text-lg leading-relaxed pl-4 relative z-10">
                    {item.message}
                  </p>
                  <span className="absolute -bottom-6 right-0 text-4xl text-slate-200 font-serif rotate-180">"</span>
                </div>

                {/* Footer / Encouragement label */}
                <div className="mt-8 pt-4">
                  <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 font-bold text-sm px-4 py-2 rounded-full border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Keep up the great work!
                  </span>
                </div>

              </div>
            ))}
          </div>
        ) : (
          /* 🌟 EMPTY STATE (If no feedback yet) */
          <div className="bg-white/80 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
            <div className="text-7xl mb-6 grayscale opacity-40">📬</div>
            <h3 className="text-3xl font-black text-slate-700 mb-3">Your mailbox is waiting!</h3>
            <p className="text-slate-500 font-bold text-lg max-w-md">
              Complete more lessons and quizzes. Your teachers will send you stars and messages here very soon.
            </p>
            <button 
              onClick={() => window.location.href = '/student/lessons'}
              className="mt-8 bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-4 rounded-2xl shadow-sm transition-all hover:-translate-y-1 cursor-pointer"
            >
              Go to Lessons 🚀
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Feedback;