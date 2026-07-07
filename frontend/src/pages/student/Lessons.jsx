import React from 'react';
import { useNavigate } from 'react-router-dom'; // Navigation walata

function Lessons() {
  const navigate = useNavigate();

  // Subject Cards Data
  const subjects = [
    { 
      id: 'maths', 
      title: 'Maths', 
      topColor: 'bg-rose-50', 
      bottomColor: 'bg-rose-100', 
      
      image: '../../../public/maths.png' 
    },
    { 
      id: 'english', 
      title: 'English', 
      topColor: 'bg-amber-50', 
      bottomColor: 'bg-amber-100', 
      image: '../../../public/english.png' 
    },
    { 
      id: 'tamil', 
      title: 'Tamil', 
      topColor: 'bg-emerald-50', 
      bottomColor: 'bg-emerald-100', 
      image: '/tamil.png' 
    },
    { 
      id: 'environment', 
      title: 'Environment', 
      topColor: 'bg-sky-50', 
      bottomColor: 'bg-sky-100', 
      image: '/environment.png' 
    },
  ];
  return (
    <div className="max-w-5xl mx-auto pb-10 font-sans">
      <div className="mb-10 pt-8">
        <h1 className="text-4xl md:text-5xl font-black text-slate-700 tracking-tight mb-2">
          Select a Subject 📚
        </h1>
        <p className="text-slate-600 font-bold mt-2 text-xl">
          What do you want to learn today?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {subjects.map((sub) => (
          <div 
            key={sub.id} 
            onClick={() => navigate(`/lessons/${sub.id}`)}
            className="flex flex-col rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-slate-100"
          >
            {/* Top part with Image */}
            <div className={`h-48 flex items-center justify-center p-4 ${sub.topColor}`}>
              
              <img 
                src={sub.image} 
                alt={sub.title} 
                className="w-full h-full object-contain drop-shadow-md" 
              />
            </div>
            
            {/* Bottom part with Text */}
            <div className={`py-4 text-center ${sub.bottomColor}`}>
              <h3 className="text-2xl font-bold text-slate-800 tracking-wider">
                {sub.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Lessons;