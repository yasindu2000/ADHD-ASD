import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quiz States
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); 
  const [score, setScore] = useState(0);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, timeSpent: "0.00" });
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  // 🌟 AI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);

  // 1. Fetch Quiz Data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`);
        const data = await response.json();

        if (data.success) {
          setQuiz(data.quiz);
          const durationNumber = parseInt(data.quiz.duration) || 5; 
          const totalSeconds = durationNumber * 60;
          
          setTimeLeft(totalSeconds);
          setTotalTime(totalSeconds);
        } else {
          toast.error("Quiz not found!");
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  // 2. Timer Countdown Logic
  useEffect(() => {
    let timer;
    if (isStarted && !isFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isStarted && !isFinished) {
      toast.error("⏳ Time is up!");
      handleSubmitQuiz(); 
    }
    return () => clearInterval(timer);
  }, [isStarted, isFinished, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // 3. Submit Quiz, Calculate Score & Get AI Feedback
  const handleSubmitQuiz = async () => {
    setIsFinished(true);
    setIsAnalyzing(true); // Start AI Loading
    let correctCount = 0;

    quiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const incorrectCount = quiz.questions.length - correctCount;
    const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
    
    const secondsSpent = totalTime - timeLeft;
    const mSpent = Math.floor(secondsSpent / 60);
    const sSpent = secondsSpent % 60;
    const formattedTimeSpent = `${mSpent}.${sSpent.toString().padStart(2, '0')}`;

    setScore(finalScore);
    setStats({ correct: correctCount, incorrect: incorrectCount, timeSpent: formattedTimeSpent });

    const studentId = localStorage.getItem('userId');
    
    // Save to Database
    if (studentId) {
      try {
        await fetch('http://localhost:5000/api/lessons/quiz-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId, lessonId: quiz.lessonId, score: finalScore,
            correct: correctCount, incorrect: incorrectCount, timeTaken: formattedTimeSpent
          })
        });
      } catch (error) { console.error("Error saving score:", error); }
    }

    // 🌟 GET AI ANALYSIS 🌟
    try {
      const aiRes = await fetch('http://localhost:5000/api/lessons/analyze-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: finalScore, correct: correctCount, incorrect: incorrectCount, timeSpent: formattedTimeSpent
        })
      });
      const aiData = await aiRes.json();
      if (aiData.success) {
        setAiFeedback(aiData.analysis);
      } else {
        // Fallback logic if AI fails
        setAiFeedback(getFallbackFeedback(finalScore));
      }
    } catch (error) {
      console.error("AI Failed, using fallback:", error);
      setAiFeedback(getFallbackFeedback(finalScore));
    } finally {
      setIsAnalyzing(false); // Stop AI Loading
    }
  };

  // Fallback function incase AI server is down
  const getFallbackFeedback = (s) => {
    if (s > 70) return { action: "NEXT_LESSON", message: "Great job! Keep it up.", buttonText: "Next Lesson →", color: "#009933" };
    if (s >= 40) return { action: "REVISE_QUIZ", message: "Good effort, but try again to improve.", buttonText: "Revise Quiz →", color: "#CCFF00" };
    return { action: "REVISE_LESSON", message: "You should review the lesson again.", buttonText: "Revise Lesson →", color: "#FF4D4D" };
  };


  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-xl font-bold">Loading your Quiz... ⏳</div>;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Failed to load quiz.</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const optionLetters = ['A.', 'B.', 'C.', 'D.', 'E.', 'F.'];

  // UI Theming based on Score (Matches your screenshot)
  const getTheme = () => {
    if (aiFeedback?.color) return aiFeedback.color; // Use AI color if available
    if (score > 70) return "#009933"; // Green
    if (score >= 40) return "#CCFF00"; // Yellow
    return "#FF4D4D"; // Red
  };
  
  const themeColor = getTheme();
  const textColor = score >= 40 && score <= 70 ? "#000000" : "#FFFFFF"; // Yellow button needs black text

  return (
    <div className="min-h-screen bg-white font-sans pb-10 flex flex-col">
      
      {!isFinished && (
        <div className="bg-[#CBEBFA] py-4 px-6 flex items-center sticky top-0 z-50 shadow-sm">
          <button onClick={() => navigate(-1)} className="text-black font-extrabold text-xl flex items-center gap-2">
            <span>←</span> Back
          </button>
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto mt-6 px-4">
        
        {!isStarted && !isFinished && (
          <div className="bg-[#EAF8FC] rounded-2xl p-10 text-center mt-10 shadow-sm border border-blue-50">
            <h2 className="text-4xl font-black text-gray-800 mb-4">{quiz.quizTitle || "Quiz Time!"}</h2>
            <p className="text-xl text-gray-700 mb-8 font-medium">
              You have <b>{parseInt(quiz.duration) || 5} minutes</b> to complete <b>{quiz.questions.length} questions</b>.
            </p>
            <button 
              onClick={() => setIsStarted(true)}
              className="bg-[#2B6CB0] text-white font-bold text-xl px-12 py-4 rounded-md hover:bg-blue-800 transition-colors"
            >
              Start Quiz
            </button>
          </div>
        )}

        {isStarted && !isFinished && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between font-bold text-black mb-2 px-1 text-sm md:text-base">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span>Time Left: {formatTime(timeLeft)}</span>
            </div>
            
            <div className="w-full bg-white h-4 rounded-full overflow-hidden mb-8 border border-gray-300">
              <div 
                className="bg-[#3B82F6] h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="bg-[#F0FDF4] md:bg-[#EAF8FC] rounded-xl p-6 md:p-10 mb-8">
              <div className="mb-8">
                <span className="text-xl md:text-3xl font-extrabold text-black border-b-4 border-[#3B82F6] pb-1 inline-block leading-snug">
                  {currentQuestionIndex + 1}. {currentQuestion?.questionText || "Question loading..."}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(index)}
                      className={`w-full text-left p-4 border transition-colors flex items-center text-lg md:text-xl font-bold
                        ${isSelected ? 'bg-[#00FF00] border-gray-400 text-black shadow-sm' : 'bg-white border-gray-400 text-black hover:bg-gray-50'}
                      `}
                    >
                      <span className="w-8 shrink-0">{optionLetters[index]}</span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button 
                onClick={handlePrev} disabled={currentQuestionIndex === 0}
                className="px-6 py-3 font-bold text-black bg-[#EAF8FC] border border-gray-300 shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                <span>←</span> Previous
              </button>

              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <button onClick={handleSubmitQuiz} className="px-8 py-3 font-bold text-white bg-[#3B82F6] hover:bg-blue-700 shadow-sm flex items-center gap-2">
                  Submit <span>→</span>
                </button>
              ) : (
                <button onClick={handleNext} className="px-8 py-3 font-bold text-white bg-[#3B82F6] hover:bg-blue-700 shadow-sm flex items-center gap-2">
                  Next <span>→</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {isFinished && (
        <div className="flex-1 w-full flex flex-col items-center bg-white animate-in zoom-in duration-500">
          
          {isAnalyzing ? (
            // 🌟 AI LOADING SCREEN
            <div className="mt-32 flex flex-col items-center justify-center">
              <div className="text-6xl mb-6 animate-bounce">🤖</div>
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-2xl font-black text-blue-600">AI is analyzing your performance...</h2>
              <p className="text-gray-500 font-bold mt-2">Please wait a moment.</p>
            </div>
          ) : (
            // 🌟 RESULTS SCREEN (Matches your screenshot layout)
            <>
              <div className="w-full bg-[#EAF8FC] pt-6 pb-16 relative border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4">
                  <button onClick={() => navigate('/dashboard')} className="bg-[#CBEBFA] border border-blue-200 text-black font-bold px-4 py-2 rounded-md flex items-center gap-2 w-max shadow-sm">
                    <span>←</span> Dashboard
                  </button>
                  
                  <div className="text-center mt-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Quiz Completed!</h2>
                    <p className="text-sm font-bold text-gray-600 mb-1">Your Score</p>
                    <h1 className="text-4xl font-black text-black">
                      {stats.correct} out of {quiz.questions.length}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="w-full bg-white flex flex-col items-center relative -mt-24">
                
                {/* 🌟 Dynamic Progress Circle */}
                <div className="bg-white p-2 rounded-full shadow-sm mb-6 z-10 border border-gray-100">
                  <div className="relative w-48 h-48 flex items-center justify-center bg-white rounded-full">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="80" fill="none" stroke="#E5E7EB" strokeWidth="16" />
                      <circle 
                        cx="96" cy="96" r="80" fill="none" 
                        stroke={themeColor} 
                        strokeWidth="16" strokeLinecap="round" 
                        strokeDasharray={`${(score / 100) * 502} 502`} 
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute text-5xl font-black" style={{ color: themeColor }}>
                      {score}%
                    </div>
                  </div>
                </div>

                {/* 🌟 AI Feedback Message */}
                {aiFeedback?.message && (
                  <p className="text-lg font-bold text-gray-600 italic mb-8 px-4 text-center">
                    "{aiFeedback.message}"
                  </p>
                )}

                {/* Metrics Row */}
                <div className="flex justify-center items-center gap-4 md:gap-12 mb-12 text-center w-full px-2">
                  <div className="flex flex-col items-center border-r border-gray-200 pr-4 md:pr-12">
                    <p className="text-xs font-bold text-gray-800 flex items-center gap-1 mb-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Duration
                    </p>
                    <p className="text-xl font-black text-black">{stats.timeSpent}</p>
                  </div>

                  <div className="flex flex-col items-center border-r border-gray-200 pr-4 md:pr-12">
                    <p className="text-xs font-bold text-gray-800 flex items-center gap-1 mb-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Correct Answers
                    </p>
                    <p className="text-xl font-black text-black">{stats.correct}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <p className="text-xs font-bold text-gray-800 flex items-center gap-1 mb-2">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Incorrect Answers
                    </p>
                    <p className="text-xl font-black text-black">{stats.incorrect}</p>
                  </div>
                </div>

                {/* 🌟 Dynamic Action Button */}
                <button 
                  onClick={() => {
                    const action = aiFeedback?.action;
                    if (action === 'NEXT_LESSON') navigate('/lessons');
                    else if (action === 'REVISE_QUIZ') window.location.reload();
                    else if (action === 'REVISE_LESSON') navigate(`/lesson-view/${quiz.lessonId}`);
                    else navigate('/lessons'); // Fallback
                  }}
                  style={{ backgroundColor: themeColor, color: textColor }}
                  className="font-bold text-xl px-12 py-4 rounded-xl flex items-center gap-2 shadow-sm transition-transform hover:scale-105"
                >
                  {aiFeedback?.buttonText || "Next Lesson →"}
                </button>
                
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}

export default TakeQuiz;