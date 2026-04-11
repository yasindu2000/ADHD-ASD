import React from 'react';
import { useNavigate } from 'react-router-dom';

function Games() {
  const navigate = useNavigate();

  // ADHD/ASD Friendly Games List
  const gamesList = [
    {
      id: 'memory-match',
      title: 'Memory Match',
      description: 'Find the matching animal friends!',
      icon: '🐢',
      bgColor: 'bg-[#D1FAE5]', // Soft Mint Green
      borderColor: 'border-[#A7F3D0]',
      textColor: 'text-emerald-800'
    },
    {
      id: 'balloon-pop',
      title: 'Balloon Pop',
      description: 'Pop the right colors in the sky!',
      icon: '🎈',
      bgColor: 'bg-[#DBEAFE]', // Soft Sky Blue
      borderColor: 'border-[#BFDBFE]',
      textColor: 'text-blue-800'
    },
    {
      id: 'pattern-puzzle',
      title: 'Pattern Puzzle',
      description: 'Guess what comes next!',
      icon: '🧩',
      bgColor: 'bg-[#FEF3C7]', // Soft Warm Yellow
      borderColor: 'border-[#FDE68A]',
      textColor: 'text-amber-800'
    },
    {
      id: 'math-catch',
      title: 'Math Catch',
      description: 'Catch the correct falling numbers!',
      icon: '🍎',
      bgColor: 'bg-[#FCE7F3]', // Soft Pink
      borderColor: 'border-[#FBCFE8]',
      textColor: 'text-pink-800'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F8FB] font-sans pb-12 px-4 md:px-8">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto pt-10 mb-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-500 hover:text-gray-800 font-bold flex items-center gap-2 mb-6 bg-white px-6 py-3 rounded-full shadow-sm w-fit transition-all hover:shadow-md"
        >
          <span className="text-xl">←</span> Back to Dashboard
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[#1E3A8A] tracking-tight">
              Play & Learn! 🎮
            </h1>
            <p className="text-[#64748B] font-bold mt-2 text-xl">
              Have fun, train your brain, and earn high scores.
            </p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-3">
            <div className="text-3xl">⭐</div>
            <div className="text-gray-700 font-black text-xl">Games Hub</div>
          </div>
        </div>
      </div>

      {/* GAMES GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {gamesList.map((game) => (
          <div 
            key={game.id}
            onClick={() => navigate(`/games/${game.id}`)}
            className={`${game.bgColor} rounded-[2rem] p-8 md:p-10 border-4 ${game.borderColor} shadow-sm cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex flex-col md:flex-row items-center gap-8 group`}
          >
            {/* BIG ICON */}
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-[2rem] bg-white/60 flex items-center justify-center text-7xl md:text-8xl shadow-inner group-hover:scale-110 transition-transform duration-300 border-2 border-white/50">
              {game.icon}
            </div>

            {/* DETAILS */}
            <div className="flex-1 text-center md:text-left flex flex-col justify-between h-full">
              <div>
                <h2 className={`text-3xl md:text-4xl font-black ${game.textColor} mb-3 leading-tight`}>
                  {game.title}
                </h2>
                <p className={`font-bold text-lg mb-6 opacity-80 ${game.textColor}`}>
                  {game.description}
                </p>
              </div>
              
              <button className={`bg-white px-8 py-4 rounded-2xl font-black text-xl shadow-sm ${game.textColor} group-hover:bg-gray-50 transition-colors w-full md:w-fit flex justify-center items-center gap-2`}>
                Play Now <span>➔</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Games;