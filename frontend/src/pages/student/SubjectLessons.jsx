import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function SubjectLessons() {
  const { subjectName } = useParams(); 
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const studentGrade = localStorage.getItem('studentGrade');

  const themeColors = {
    'maths': {
      cardBg: 'bg-gradient-to-b from-[#FFD1D1] to-[#FFBABA]',
      textColor: 'text-gray-800',
      titleColor: 'text-pink-600'
    },
    'english': {
      cardBg: 'bg-gradient-to-b from-[#FEF0A5] to-[#FCE679]',
      textColor: 'text-gray-800',
      titleColor: 'text-yellow-600'
    },
    'tamil': {
      cardBg: 'bg-gradient-to-b from-[#B4F8C8] to-[#91F3AD]',
      textColor: 'text-gray-800',
      titleColor: 'text-green-600'
    },
    'environment': {
      cardBg: 'bg-gradient-to-b from-[#CBEBFA] to-[#A8E1FA]',
      textColor: 'text-gray-800',
      titleColor: 'text-sky-600'
    }
  };

  const theme = themeColors[subjectName] || themeColors['maths'];
  const displayTitle = subjectName.charAt(0).toUpperCase() + subjectName.slice(1);

  useEffect(() => {
    if (!studentGrade) {
      setIsLoading(false);
      return;
    }

    const fetchSubjectLessons = async () => {
      try {
        setIsLoading(true);
        const studentId = localStorage.getItem('userId');
        
        // 1. Get lessons for the subject & grade
        const response = await fetch(`http://localhost:5000/api/lessons/get/${studentGrade}/${subjectName}`);
        const data = await response.json();

        if (data.success) {
          let progressMap = {};
          
          // 2. Get all progress for this student
          if (studentId) {
            try {
              const progRes = await fetch(`http://localhost:5000/api/lessons/all-progress/${studentId}`);
              const progData = await progRes.json();
              if (progData.success) {
                progData.allProgress.forEach(p => {
                  // lessonId ekata adala iwara karapu parts gaana map eke save karanawa
                  progressMap[p.lessonId] = p.completedParts.length;
                });
              }
            } catch (err) {
              console.error("Failed to fetch progress", err);
            }
          }

          // 3. Map progress to each lesson card
          const formattedLessons = data.lessons.map(lesson => {
            const totalParts = lesson.parts?.length || 0;
            const completedCount = progressMap[lesson._id] || 0;
            // Calculate percentage
            const progressPercentage = totalParts > 0 ? Math.round((completedCount / totalParts) * 100) : 0;

            return {
              id: lesson._id,
              title: lesson.title,
              duration: `${totalParts} Parts`, 
              progress: progressPercentage, // Hariyatama calculation wuna pattiya
              totalParts: totalParts,
              completedCount: completedCount
            };
          });
          
          setLessons(formattedLessons);
        }
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectLessons();
  }, [subjectName, studentGrade]);

  return (
    <div className="max-w-6xl mx-auto pb-10 font-sans">
      <div className="mb-10 flex flex-col gap-4">
        <button 
          onClick={() => navigate('/lessons')}
          className="w-max flex items-center gap-2 cursor-pointer text-2xl text-gray-500 hover:text-gray-800 font-bold transition-colors"
        >
          <span className="text-3xl cursor-pointer ">⬅</span> Back to Subjects
        </button>
        <h1 className={`text-4xl mt-8 font-bold tracking-wide `}>
          {displayTitle} Lessons 📖
        </h1>
      </div>

      {!studentGrade ? (
        <div className="py-20 text-center bg-red-50 rounded-[3rem] border-2 border-red-200 shadow-sm">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h3 className="text-2xl font-bold text-red-600 mb-2">Student Grade Not Found!</h3>
          <p className="text-red-500 font-medium mb-6">We don't know which grade's lessons to show you.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lessons.length > 0 ? (
            lessons.map((lesson) => (
              <div 
                key={lesson.id} 
                className={`${theme.cardBg} border border-white/40 rounded-[2.5rem] p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group`}
              >
                <div className="flex justify-between items-start mb-4 border-b border-black/10 pb-4">
                  <h3 className={`text-2xl font-black ${theme.textColor} leading-tight drop-shadow-sm`}>
                    {lesson.title}
                  </h3>
                  <span className="text-xs font-bold text-gray-700 whitespace-nowrap bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                    🎬 {lesson.duration}
                  </span>
                </div>

                <div className="mt-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-extrabold ${theme.textColor} opacity-80`}>Progress</span>
                    <span className={`text-sm font-black ${lesson.progress >= 100 ? 'text-green-700' : 'text-blue-700'}`}>
                      {lesson.progress}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-white/50 h-4 rounded-full overflow-hidden shadow-inner border border-white/30 backdrop-blur-sm relative">
                    <div 
                      className={`h-full transition-all duration-700 ease-out ${
                        lesson.progress >= 100 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]'
                      }`} 
                      style={{ width: `${lesson.progress}%` }}
                    ></div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/lesson-view/${lesson.id}`)} 
                  className={`mt-10 w-full py-4 rounded-3xl font-bold cursor-pointer text-xl transition-all shadow-md active:scale-95 ${
                    lesson.progress >= 100 
                    ? 'bg-white/60 text-gray-700 hover:bg-white/80 border border-white/50' 
                    : 'bg-white text-gray-800 hover:bg-gray-50 shadow-[0_8px_20px_rgba(0,0,0,0.1)]'
                  }`}
                >
                  {lesson.progress >= 100 ? 'Review Lesson' : (lesson.progress > 0 ? 'Continue Lesson' : 'Start Lesson')}
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <h3 className="text-2xl font-bold text-gray-400">Lessons coming soon! 🚀</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SubjectLessons;