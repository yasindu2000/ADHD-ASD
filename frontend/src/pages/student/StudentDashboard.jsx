import React, { useState, useEffect } from 'react';

function StudentDashboard() {
  // LocalStorage eken user ge nama gannawa. (Nathnam 'Student' kiyala default pennanawa)
  const [userName, setUserName] = useState('Student');
  const [selectedFeeling, setSelectedFeeling] = useState(null);

  useEffect(() => {
    // Login wunama save karapu nama ganna
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      // Palamu akura capital karanawa
      const formattedName = storedName.charAt(0).toUpperCase() + storedName.slice(1);
      setUserName(formattedName);
    }
  }, []);

  // Chart eke data
  const weeklyProgress = [
    { day: 'Mon', value: 20, color: 'bg-red-300' },
    { day: 'Tue', value: 60, color: 'bg-yellow-300' },
    { day: 'Wed', value: 45, color: 'bg-green-300' },
    { day: 'Thu', value: 90, color: 'bg-cyan-400' },
    { day: 'Fri', value: 65, color: 'bg-fuchsia-300' },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-10 font-sans">
      
      {/* TOP HEADER: Greeting & Profile Icon */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-mono text-gray-800 tracking-wide">
          Hello {userName}! 👋
        </h1>
        {/* Placeholder Profile Picture */}
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* SECTION 1: Feelings Tracker */}
      {/* SECTION 1: Feelings Tracker */}
      <div className="bg-[#EFF7B8] rounded-[2rem] p-6 mb-10 shadow-sm border border-[#E1EDB0]">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-xl font-bold text-gray-700">How are you feeling today?</h3>
          <span className="text-gray-500 font-semibold">Pick one!</span>
        </div>
        
        <div className="flex flex-wrap gap-4 px-2 ">
          {/* Feeling Emojis (Buttons) */}
          {['🤩', '😌', '🙂', '😐', '🥱', '😔'].map((emoji, index) => {
            
            // Check karanawa danata mokak hari select wela da thiyenne kiyala
            const isSelected = selectedFeeling === index;
            const hasSelection = selectedFeeling !== null;

            return (
              <button
                key={index}
                onClick={() => setSelectedFeeling(index)}
                className={`text-5xl cursor-pointer transition-all duration-300 p-3 rounded-2xl
                  ${isSelected ? 'bg-white shadow-md scale-110 opacity-100' : 'bg-white/40 hover:scale-110'} 
                  ${hasSelection && !isSelected ? 'opacity-30 scale-95 grayscale-[30%]' : 'opacity-100'}
                `}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Today's Lessons */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Today's Lessons</h2>
          <div className="flex-1 h-[2px] bg-gray-300"></div>
        </div>

        {/* Lesson Card */}
        <div className="bg-[#CBEBFA] rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-sm border border-blue-100">
          
          {/* Left Side: Text Details */}
          <div className="z-10 relative w-full md:w-1/2">
            <h3 className="text-5xl font-black text-gray-600 border-b-2 border-gray-400/30 pb-3 mb-4 inline-block w-full max-w-[200px]">
              Maths
            </h3>
            <p className="text-2xl font-extrabold text-gray-900 mb-2">Addition Basics</p>
            <p className="text-lg font-bold text-gray-700 mb-8 flex items-center gap-2">
              lesson 4 <span className="text-gray-500">&gt;</span> 10 min
            </p>
            <button className="bg-[#03C734] hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold text-xl transition-all shadow-[0_5px_15px_rgba(3,199,52,0.4)] hover:-translate-y-1">
              Start lesson
            </button>
          </div>

          {/* Right Side: Illustration Placeholder */}
          <div className="mt-8 md:mt-0 w-full md:w-1/2 flex justify-end">
            <div className="text-9xl relative z-10 drop-shadow-2xl">
              <img src="../../../public/dashboard.png" alt="" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Progress Chart */}
      <div>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Your Progress</h2>
          <div className="flex-1 h-[2px] bg-gray-300"></div>
          <span className="text-[#0EA5E9] font-bold text-lg">Weekly</span>
        </div>

        {/* Custom CSS Bar Chart */}
        <div className="flex h-64 w-full md:w-3/4 max-w-2xl relative mt-4">
          
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between items-end pr-4 text-xs font-bold text-gray-700 h-full border-r-2 border-gray-400 pb-6 w-20">
            <span>Very<br/>Good -</span>
            <span>Good -</span>
            <span>Poor -</span>
            <span>very<br/>Poor -</span>
            <span>0 -</span>
          </div>

          {/* Bars Container */}
          <div className="flex justify-around items-end w-full h-full pb-6 border-b-2 border-gray-400 relative px-4">
            {weeklyProgress.map((item, index) => (
              <div key={index} className="flex flex-col items-center justify-end h-full w-12 group">
                {/* The Bar */}
                <div 
                  className={`w-full rounded-sm ${item.color} transition-all duration-700 hover:opacity-80 relative`}
                  style={{ height: `${item.value}%` }}
                >
                  {/* Hover effect number (Optional) */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.value}%
                  </span>
                </div>
                {/* X-Axis Label */}
                <span className="text-xs font-bold text-gray-700 absolute -bottom-5">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default StudentDashboard;