import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

function LessonView() {
  const navigate = useNavigate();
  const { lessonId } = useParams(); 

  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Progress States
  const [completedCount, setCompletedCount] = useState(0);
  const [completedPartsArray, setCompletedPartsArray] = useState([]); 
  const [activePartIndex, setActivePartIndex] = useState(0); 
  
  // 🌟 FIX: Aluth states deka (Quiz eka kalin karalada? Marks keeyada?)
  const [quizAttempted, setQuizAttempted] = useState(false);
  const [previousScore, setPreviousScore] = useState(0);

  // 🌟 NEW: Pop-up Modal State
  const [showFinishModal, setShowFinishModal] = useState(false);

  const playerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentId = localStorage.getItem('userId');

        // 1. Fetch Lesson Data
        const lessonRes = await fetch(`http://localhost:5000/api/lessons/${lessonId}`);
        const lessonData = await lessonRes.json();
        
        if (lessonData.success) {
          setLesson(lessonData.lesson);
        } else {
          toast.error("Lesson not found!");
          setLoading(false);
          return; 
        }

        // 2. Fetch Progress Data
        if (studentId) {
          try {
            const progressRes = await fetch(`http://localhost:5000/api/lessons/progress/${studentId}/${lessonId}`);
            if (progressRes.ok) {
              const progressData = await progressRes.json();
              
              if (progressData.success) {
                const progObj = progressData.progress || progressData;

                if (progObj.completedParts) {
                  setCompletedPartsArray(progObj.completedParts);
                  setCompletedCount(progObj.completedParts.length);
                  
                  const totalParts = lessonData.lesson.parts.length;
                  const completed = progObj.completedParts.length;
                  
                  if (completed < totalParts) {
                    setActivePartIndex(completed);
                  } else {
                    setActivePartIndex(0);
                  }
                }

                if (progObj.isQuizCompleted) {
                  setQuizAttempted(true);
                  setPreviousScore(progObj.quizScore || 0);
                }
              }
            }
          } catch (progressError) {
            console.error("Error fetching progress:", progressError);
          }
        }

        // 3. Fetch Quiz Data Safely
        try {
          const quizRes = await fetch(`http://localhost:5000/api/quizzes/lesson/${lessonId}`);
          if (quizRes.ok) {
             const quizData = await quizRes.json();
             if (quizData.success && quizData.quiz) {
                const validQuiz = Array.isArray(quizData.quiz) ? quizData.quiz[0] : quizData.quiz;
                setQuiz(validQuiz);
             }
          } else {
             setQuiz(null); 
          }
        } catch (quizError) {
          console.error("Error fetching quiz:", quizError);
          setQuiz(null); 
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) fetchData();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAF8FC] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-xl font-bold text-gray-500">Loading Lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return <div className="min-h-screen bg-[#EAF8FC] flex items-center justify-center text-xl font-bold text-red-500">Lesson not found!</div>;
  }

  const totalParts = lesson.parts?.length || 0;
  const progressPercentage = totalParts > 0 ? Math.round((completedCount / totalParts) * 100) : 0;
  const isQuizUnlocked = completedCount >= totalParts;

  const handlePlaySegment = (index) => {
    setActivePartIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVideoEnd = async () => {
    const studentId = localStorage.getItem('userId');
    
    if (!completedPartsArray.includes(activePartIndex)) {
      const newCompletedPartsArray = [...completedPartsArray, activePartIndex];
      const newCompletedCount = newCompletedPartsArray.length;
      
      setCompletedPartsArray(newCompletedPartsArray);
      setCompletedCount(newCompletedCount);

      if (studentId) {
        try {
          await fetch('http://localhost:5000/api/lessons/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentId: studentId,
              lessonId: lessonId,
              partIndex: activePartIndex
            })
          });
        } catch (error) {
          console.error("Failed to save progress", error);
        }
      }

      if (newCompletedCount < totalParts) {
        toast.success("Great job! Next part unlocked. 🌟");
        setActivePartIndex(activePartIndex + 1); 
      } else {
        // 🌟 LESSON COMPLETED! Show the Modal
        toast.success("Lesson Completed! 🎉", { duration: 4000 });
        setShowFinishModal(true);
      }
    } else {
      if (activePartIndex + 1 < totalParts) {
         setActivePartIndex(activePartIndex + 1);
      }
    }
  };

  const activeVideoUrl = lesson.parts[activePartIndex]?.videoUrl;

  return (
    <div className="min-h-screen bg-[#EAF8FC] pb-10 font-sans">
      
      {/* 🌟 FINISH MODAL (Pop-up) 🌟 */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in duration-300 border-4 border-white">
            
            <button 
              onClick={() => setShowFinishModal(false)}
              className="absolute top-6 right-8 text-3xl font-black text-gray-300 hover:text-gray-800 transition-colors"
            >
              ✕
            </button>

            <div className="p-10 text-center">
              <h2 className="text-4xl font-black text-gray-800 mb-8 border-b-4 border-blue-400 pb-2 inline-block">
                How are you feeling?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                
                {/* 1. HAPPY - Continue */}
                <div className="bg-green-50 p-6 rounded-[2rem] border-2 border-green-100 hover:border-green-400 transition-all group">
                  <span className="text-7xl block mb-4 group-hover:scale-110 transition-transform">🤩</span>
                  <button 
                    onClick={() => setShowFinishModal(false)}
                    className="w-full bg-green-500 text-white py-3 rounded-2xl font-black shadow-lg shadow-green-200 hover:bg-green-600 active:scale-95 transition-all"
                  >
                    Continue
                  </button>
                </div>

                {/* 2. BORED - Play Games */}
                <div className="bg-blue-50 p-6 rounded-[2rem] border-2 border-blue-100 hover:border-blue-400 transition-all group">
                  <span className="text-7xl block mb-4 group-hover:scale-110 transition-transform">😐</span>
                  <button 
                    onClick={() => navigate('/games')}
                    className="w-full bg-blue-500 text-white py-3 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all"
                  >
                    Play Game
                  </button>
                </div>

                {/* 3. TIRED - Break */}
                <div className="bg-orange-50 p-6 rounded-[2rem] border-2 border-orange-100 hover:border-orange-400 transition-all group">
                  <span className="text-7xl block mb-4 group-hover:scale-110 transition-transform">🥱</span>
                  <button 
                    onClick={() => navigate('/break-timer')}
                    className="w-full bg-orange-500 text-white py-3 rounded-2xl font-black shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all"
                  >
                    Short Break
                  </button>
                </div>

              </div>

              <p className="font-black text-gray-400 text-2xl italic tracking-widest">Pick One!</p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-[#CBEBFA] py-4 px-6 flex items-center shadow-sm relative sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="text-gray-800 font-extrabold text-xl flex items-center gap-2 hover:scale-105 transition-transform z-10 bg-white/50 px-4 py-1 rounded-full backdrop-blur-sm cursor-pointer"
        >
          <span>⬅</span> Back
        </button>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 absolute w-full text-center left-0 px-24 truncate drop-shadow-sm">
          {lesson.title}
        </h1>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        
        {/* VIDEO PLAYER */}
        <div className="bg-black rounded-3xl overflow-hidden shadow-2xl mb-8 aspect-video relative group border-4 border-white/50">
          {activeVideoUrl ? (
            <video
              ref={playerRef}
              key={activeVideoUrl} 
              controls
              controlsList="nodownload"
              onEnded={handleVideoEnd}
              className="w-full h-full object-contain bg-black"
            >
              <source src={activeVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
              <p className="font-bold text-gray-500">Video not available</p>
            </div>
          )}
          
          <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <h2 className="text-white font-bold text-lg drop-shadow-md">
                Part {activePartIndex + 1}: {lesson.parts[activePartIndex]?.title}
              </h2>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-blue-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-gray-800 text-lg">Your Progress</h3>
            <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
              {completedCount} / {totalParts} Parts
            </span>
          </div>
          <div className="relative w-full bg-gray-100 rounded-full h-6 flex items-center shadow-inner overflow-hidden border border-gray-200">
            <div 
              className="bg-gradient-to-r from-[#03C734] to-[#20E551] h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-white/20"></div>
            </div>
            <span className={`absolute right-4 font-bold text-xs z-10 ${progressPercentage > 90 ? 'text-white drop-shadow-md' : 'text-gray-500'}`}>
              {progressPercentage}% Complete
            </span>
          </div>
        </div>

        {/* COURSE CONTENT */}
        <h3 className="text-2xl font-black text-gray-800 mb-6 px-2">Course Content</h3>
        <div className="space-y-4 mb-12">
          {lesson.parts.map((segment, index) => {
            const isCompleted = completedPartsArray.includes(index);
            const isUnlocked = isCompleted || index === completedCount;
            const isActive = index === activePartIndex;

            return (
              <div 
                key={segment._id || index} 
                onClick={() => isUnlocked && handlePlaySegment(index)}
                className={`relative flex items-center p-4 rounded-3xl border-2 transition-all duration-300 ${
                  isActive ? 'bg-blue-50 border-blue-400 shadow-md transform scale-[1.01]' :
                  isUnlocked ? 'bg-white border-transparent shadow-sm hover:shadow-md cursor-pointer hover:border-blue-200' : 
                  'bg-gray-100 border-gray-200 opacity-75 cursor-not-allowed'
                }`}
              >
                <div className="w-12 flex justify-center shrink-0">
                  {isActive ? (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-inner">
                      <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                    </div>
                  ) : isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-inner">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  ) : (
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${isUnlocked ? 'border-gray-400 text-gray-500' : 'border-gray-300 text-gray-400'}`}>
                      {index + 1}
                    </div>
                  )}
                </div>

                <div className="ml-2 flex-1 pr-4">
                  <h4 className={`text-lg sm:text-xl font-bold ${isActive ? 'text-blue-700' : isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                    {segment.title || `Part ${index + 1}`}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <p className={`text-sm font-semibold flex items-center gap-1 ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {segment.duration}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 🏆 QUIZ SECTION 🏆 */}
        <div className="bg-gradient-to-br from-[#E4F2F7] to-white rounded-[2rem] p-8 md:p-10 text-center border-2 border-[#CDE5EF] shadow-lg relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 text-9xl opacity-5">🏆</div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-4 relative z-10">Knowledge Check!</h2>
          {quiz ? (
            <div className="relative z-10">
              {quizAttempted ? (
                <div className="mb-8 animate-in zoom-in duration-300">
                  <div className="inline-block bg-green-100 border-2 border-green-500 text-green-700 font-black px-6 py-2 rounded-full mb-4 shadow-sm">
                    ✅ Quiz Completed!
                  </div>
                  <div className="text-xl font-bold text-gray-600">
                    Previous Score: <span className={`text-3xl ml-2 font-black ${previousScore >= 50 ? 'text-green-600' : 'text-red-500'}`}>{previousScore}%</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 font-medium mb-6 text-lg max-w-md mx-auto">
                  Test what you've learned in this lesson. Complete all videos to unlock the quiz.
                </p>
              )}
              <div className="flex justify-center items-center gap-6 text-gray-700 font-bold mb-8 bg-white/60 w-fit mx-auto px-6 py-3 rounded-2xl border border-white">
                <span className="flex items-center gap-2">📝 {quiz.questions?.length || 0} Questions</span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-2">⏳ {parseInt(quiz.duration) || 5} mins</span>
              </div>
              <button 
                disabled={!isQuizUnlocked}
                onClick={() => navigate(`/quiz/${quiz._id || quiz.id}`)}
                className={`px-12 py-4 rounded-2xl font-black text-xl transition-all duration-300 transform shadow-md ${
                  !isQuizUnlocked 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300'
                    : quizAttempted
                      ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-[0_10px_20px_rgba(225,29,72,0.3)] hover:scale-105 active:scale-95 cursor-pointer border border-red-400'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 cursor-pointer border border-blue-500'
                }`}
              >
                {!isQuizUnlocked ? '🔒 Finish videos to unlock' : quizAttempted ? 'Re-attempt Quiz 🔄' : 'Start Quiz Now 🚀'}
              </button>
            </div>
          ) : (
            <div className="py-8 relative z-10">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500 font-bold text-xl">Great! You've finished the lesson.</p>
              <p className="text-gray-400 mt-2">No quiz assigned for this topic.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LessonView;