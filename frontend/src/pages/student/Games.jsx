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
      bgColor: 'bg-emerald-50', 
      borderColor: 'border-emerald-100',
      textColor: 'text-emerald-700'
    },
    {
      id: 'balloon-pop',
      title: 'Balloon Pop',
      description: 'Pop the right colors in the sky!',
      icon: '🎈',
      bgColor: 'bg-sky-50', 
      borderColor: 'border-sky-100',
      textColor: 'text-sky-700'
    },
    {
      id: 'pattern-puzzle',
      title: 'Pattern Puzzle',
      description: 'Guess what comes next!',
      icon: '🧩',
      bgColor: 'bg-amber-50', 
      borderColor: 'border-amber-100',
      textColor: 'text-amber-700'
    },
    {
      id: 'math-catch',
      title: 'Math Catch',
      description: 'Catch the correct falling numbers!',
      icon: '🍎',
      bgColor: 'bg-rose-50', 
      borderColor: 'border-rose-100',
      textColor: 'text-rose-700'
    }
  ];

  return (
    <div className="font-sans pb-12">
      
      
      <div className="max-w-6xl mx-auto pt-1 mb-10">
        
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-700 tracking-tight">
              Play & Learn! 🎮
            </h1>
            <p className="text-slate-600 font-bold mt-2 text-xl">
              Have fun, train your brain, and earn high scores.
            </p>
          </div>
          
        </div>
      </div>

      
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {gamesList.map((game) => (
          <div 
            key={game.id}
            onClick={() => navigate(`/games/${game.id}`)}
            className={`${game.bgColor} rounded-[2rem] p-8 md:p-10 border-4 ${game.borderColor} shadow-sm cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex flex-col md:flex-row items-center gap-8 group`}
          >
          
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-[2rem] bg-white/60 flex items-center justify-center text-7xl md:text-8xl shadow-inner group-hover:scale-110 transition-transform duration-300 border-2 border-white/50">
              {game.icon}
            </div>

            
            <div className="flex-1 text-center md:text-left flex flex-col justify-between h-full">
              <div>
                <h2 className={`text-3xl md:text-4xl font-black ${game.textColor} mb-3 leading-tight`}>
                  {game.title}
                </h2>
                <p className={`font-bold text-lg mb-6 opacity-80 ${game.textColor}`}>
                  {game.description}
                </p>
              </div>
              
              <button className={`bg-white px-8 py-4 rounded-2xl font-black text-xl shadow-sm ${game.textColor} group-hover:scale-105 transition-all duration-300 w-full md:w-fit flex justify-center items-center gap-2 cursor-pointer border border-white/50`}>
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