import React from 'react';
import { useNavigate } from 'react-router-dom'; // Navigation walata

function Lessons() {
  const navigate = useNavigate();

  // Subject Cards Data
  const subjects = [
    { 
      id: 'maths', 
      title: 'Maths', 
      topColor: 'bg-[#FFD1D1]', 
      bottomColor: 'bg-[#FFBABA]', 
      // Emoji eka ain karala oyage image eke nama danna (public folder eke thiyena widihata)
      image: '../../../public/maths.png' 
    },
    { 
      id: 'english', 
      title: 'English', 
      topColor: 'bg-[#FEF0A5]', 
      bottomColor: 'bg-[#FCE679]', 
      image: '../../../public/english.png' 
    },
    { 
      id: 'tamil', 
      title: 'Tamil', 
      topColor: 'bg-[#B4F8C8]', 
      bottomColor: 'bg-[#91F3AD]', 
      image: '/tamil.png' 
    },
    { 
      id: 'environment', 
      title: 'Environment', 
      topColor: 'bg-[#CBEBFA]', 
      bottomColor: 'bg-[#A8E1FA]', 
      image: '/environment.png' 
    },
  ];
  return (
    <div className="max-w-5xl mx-auto pb-10 font-sans">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-wider text-gray-800  mb-2">
          Select a Subject 📚
        </h1>
        <p className="text-gray-500 font-medium font-mono tracking-wider text-lg">
          What do you want to learn today?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {subjects.map((sub) => (
          <div 
            key={sub.id} 
            onClick={() => navigate(`/lessons/${sub.id}`)}
            className="flex flex-col rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-100"
          >
            {/* Top part with Image */}
            <div className={`h-48 flex items-center justify-center p-4 ${sub.topColor}`}>
              {/* MEKA ALUTHIN DAMMA */}
              <img 
                src={sub.image} 
                alt={sub.title} 
                className="w-full h-full object-contain drop-shadow-md" 
              />
            </div>
            
            {/* Bottom part with Text */}
            <div className={`py-4 text-center ${sub.bottomColor}`}>
              <h3 className="text-2xl font-bold text-gray-900 tracking-wider">
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