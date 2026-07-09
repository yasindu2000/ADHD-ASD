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
        Opening your feedback letters... <svg className="ml-3 w-8 h-8 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
      </div>
    );
  }

  return (
    <div className="font-sans pb-12 selection:bg-sky-100">
      <div className="max-w-5xl mx-auto pt-8">

        {/* 🌟 HEADER */}
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-700 tracking-tight drop-shadow-sm flex items-center justify-center md:justify-start gap-3">
              My <span className="text-slate-700">Feedback</span> 
              <svg className="w-10 h-10 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            </h2>
            <p className="text-slate-500 font-bold mt-3 text-lg tracking-wide">
              See what your teachers have to say about your great work!
            </p>
          </div>
          <div className="hidden md:flex w-20 h-20 rounded-full bg-white shadow-sm border border-slate-100 items-center justify-center hover:scale-105 transition-transform duration-300 transform rotate-12">
            <svg className="w-10 h-10 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
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
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
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
                        className={i < item.stars ? 'text-amber-400' : 'text-slate-200'}
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
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
            <div className="mb-6">
              <svg className="w-24 h-24 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            </div>
            <h3 className="text-3xl font-black text-slate-700 mb-3">Your mailbox is waiting!</h3>
            <p className="text-slate-500 font-bold text-lg max-w-md">
              Complete more lessons and quizzes. Your teachers will send you stars and messages here very soon.
            </p>
            <button
              onClick={() => window.location.href = '/student/lessons'}
              className="mt-8 bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-4 rounded-2xl shadow-sm transition-all hover:-translate-y-1 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                Go to Lessons 
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Feedback;