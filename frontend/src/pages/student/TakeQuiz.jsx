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
    if (s > 70) return { action: "NEXT_LESSON", message: "Great job! Keep it up.", buttonText: "Next Lesson ➔", color: "#34D399" };
    if (s >= 40) return { action: "REVISE_QUIZ", message: "Good effort, but try again to improve.", buttonText: "Revise Quiz ➔", color: "#FBBF24" };
    return { action: "REVISE_LESSON", message: "You should review the lesson again.", buttonText: "Revise Lesson ➔", color: "#FB7185" };
  };


  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-xl font-bold text-slate-500 animate-pulse">Loading your Quiz... ⏳</div>;
  if (!quiz) return <div className="min-h-screen bg-white flex items-center justify-center text-rose-500 font-bold">Failed to load quiz.</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const optionLetters = ['A.', 'B.', 'C.', 'D.', 'E.', 'F.'];

  // UI Theming based on Score
  const getTheme = () => {
    if (aiFeedback?.color) return aiFeedback.color; // Use AI color if available
    if (score > 70) return "#34D399"; // emerald-400
    if (score >= 40) return "#FBBF24"; // amber-400
    return "#FB7185"; // rose-400
  };

  const themeColor = getTheme();
  // We'll keep text white for buttons, or dark if it's yellow/amber
  const textColor = score >= 40 && score <= 70 ? "#334155" : "#FFFFFF";

  return (
    <div className={`bg-white font-sans flex flex-col -mt-8 -mx-8 -mb-8 px-8 pt-8 ${isStarted && !isFinished ? 'h-[calc(100vh)] overflow-hidden pb-4' : 'min-h-screen pb-18'}`}>

      {!isFinished && (
        <div className="w-full shrink-0 mb-2">
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700 font-extrabold text-base md:text-lg flex items-center gap-2 hover:scale-105 transition-all cursor-pointer bg-white hover:bg-slate-50 px-5 py-2 rounded-full border-2 border-slate-100 shadow-sm w-max">
            <span>⬅</span> Back
          </button>
        </div>
      )}

      <div className={`w-full max-w-3xl mx-auto px-4 flex flex-col ${isStarted && !isFinished ? 'flex-1 overflow-hidden' : 'mt-6'}`}>

        {!isStarted && !isFinished && (
          <div className="bg-sky-50 rounded-[2.5rem] p-10 text-center mt-10 shadow-sm border border-sky-100">
            <h2 className="text-4xl md:text-5xl font-black text-slate-700 mb-4 tracking-tight drop-shadow-sm">{quiz.quizTitle || "Quiz Time!"}</h2>
            <p className="text-xl text-slate-500 mb-10 font-bold tracking-wide">
              You have <b className="text-slate-700">{parseInt(quiz.duration) || 5} minutes</b> to complete <b className="text-slate-700">{quiz.questions.length} questions</b>.
            </p>
            <button
              onClick={() => setIsStarted(true)}
              className="bg-sky-500 text-white font-black text-xl px-12 py-4 rounded-2xl hover:bg-sky-600 transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer border border-white/50 inline-block"
            >
              Start Quiz 🚀
            </button>
          </div>
        )}

        {isStarted && !isFinished && (
          <div className="animate-in fade-in duration-300 flex flex-col h-full pb-4">
            <div className="flex justify-between items-center font-extrabold text-slate-400 mb-2 px-1 text-sm md:text-base tracking-widest uppercase shrink-0">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              
              {/* Visual Timer (Circular / Pie Chart style) */}
              <div className="flex flex-col items-center justify-center">
                <div className={`relative w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-sm border-2 border-slate-100 ${
                  (timeLeft / totalTime) <= 0.15 ? 'animate-pulse' : ''
                }`}>
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="24" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                    <circle
                      cx="32" cy="32" r="24" fill="none"
                      stroke={
                        (timeLeft / totalTime) > 0.4 ? '#38BDF8' : 
                        (timeLeft / totalTime) > 0.15 ? '#FBBF24' : 
                        '#F43F5E'
                      }
                      strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${(timeLeft / totalTime) * 150.8} 150.8`}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className={`w-5 h-5 ${
                      (timeLeft / totalTime) > 0.4 ? 'text-sky-400' : 
                      (timeLeft / totalTime) > 0.15 ? 'text-amber-500' : 
                      'text-rose-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-4 shadow-inner border border-slate-200 shrink-0">
              <div 
                className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="bg-sky-50 rounded-[2rem] p-5 md:p-6 mb-4 border border-sky-100 shadow-sm shrink-0">
              <div className="mb-2">
                <span className="text-xl md:text-2xl font-black text-slate-700 border-b-4 border-sky-300 pb-1 inline-block leading-snug">
                  {currentQuestionIndex + 1}. {currentQuestion?.questionText || "Question loading..."}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto px-2 pt-1 pb-2 -mx-2 flex-1 scrollbar-thin scrollbar-thumb-sky-200 scrollbar-track-transparent custom-scrollbar">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(index)}
                    className={`w-full text-left p-4 border-2 transition-all duration-300 flex items-center text-lg font-bold rounded-2xl cursor-pointer shrink-0
                      ${isSelected ? 'bg-emerald-100 border-emerald-300 text-emerald-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}
                    `}
                  >
                    <span className="w-10 shrink-0 opacity-70">{optionLetters[index]}</span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 shrink-0">
              <button 
                onClick={handlePrev} disabled={currentQuestionIndex === 0}
                className="px-6 py-3 font-bold text-slate-600 bg-white rounded-xl border-2 border-slate-200 shadow-sm disabled:opacity-40 flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>⬅</span> Previous
              </button>

              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <button 
                  onClick={handleSubmitQuiz} 
                  disabled={selectedAnswers[currentQuestionIndex] === undefined}
                  className={`px-8 py-3 font-bold text-white rounded-xl shadow-sm flex items-center gap-2 transition-all border border-white/50
                    ${selectedAnswers[currentQuestionIndex] !== undefined ? 'bg-sky-500 hover:bg-sky-600 hover:scale-105 cursor-pointer' : 'bg-slate-300 cursor-not-allowed opacity-70'}
                  `}
                >
                  Submit <span>➔</span>
                </button>
              ) : (
                <button 
                  onClick={handleNext} 
                  disabled={selectedAnswers[currentQuestionIndex] === undefined}
                  className={`px-8 py-3 font-bold text-white rounded-xl shadow-sm flex items-center gap-2 transition-all border border-white/50
                    ${selectedAnswers[currentQuestionIndex] !== undefined ? 'bg-sky-500 hover:bg-sky-600 hover:scale-105 cursor-pointer' : 'bg-slate-300 cursor-not-allowed opacity-70'}
                  `}
                >
                  Next <span>➔</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {isFinished && (
        <div className="flex-1 w-full flex flex-col items-center bg-white animate-in zoom-in duration-500 ">

          {isAnalyzing ? (
            // 🌟 AI LOADING SCREEN
            <div className="mt-20 flex flex-col items-center justify-center">
              <div className="text-6xl mb-6 animate-bounce">🤖</div>
              <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin mb-6"></div>
              <h2 className="text-3xl font-black text-slate-700 tracking-tight">AI is analyzing your performance...</h2>
              <p className="text-slate-500 font-bold mt-3 text-lg">Please wait a moment.</p>
            </div>
          ) : (
            // 🌟 RESULTS SCREEN
            <>
              <div className="w-full bg-sky-50 -mt-8 pt-10 pb-24 relative border-b-4 border-sky-100 -mx-8 px-8 rounded-b-[3rem] mb-20 shadow-sm max-w-5xl self-center">
                <div className="max-w-4xl mx-auto px-4">
                  <button onClick={() => navigate('/dashboard')} className="bg-white border-2 border-sky-100 text-slate-500 hover:text-slate-700 font-bold px-6 py-3 rounded-full flex items-center gap-2 w-max shadow-sm transition-all hover:shadow-md cursor-pointer">
                    <span>⬅</span> Dashboard
                  </button>

                  <div className="text-center mt-6">
                    <h2 className="text-xl font-extrabold text-slate-500 mb-6 uppercase tracking-widest">Quiz Completed!</h2>
                    <p className="text-sm font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Your Score</p>
                    <h1 className="text-6xl font-black text-slate-700 drop-shadow-sm">
                      {stats.correct} <span className="text-3xl text-slate-400">out of</span> {quiz.questions.length}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="w-full bg-white flex flex-col items-center relative -mt-32 max-w-4xl mx-auto">

                {/* 🌟 Dynamic Progress Circle */}
                <div className="bg-white p-3 rounded-full shadow-lg mb-10 z-10 border border-slate-100">
                  <div className="relative w-48 h-48 flex items-center justify-center bg-white rounded-full">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="80" fill="none" stroke="#F1F5F9" strokeWidth="16" />
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
                  <div className="max-w-2xl px-6 mb-12">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative">
                      <span className="absolute -top-4 -left-2 text-4xl text-slate-200 font-serif">"</span>
                      <p className="text-xl font-bold text-slate-600 italic text-center leading-relaxed">
                        {aiFeedback.message}
                      </p>
                      <span className="absolute -bottom-6 right-2 text-4xl text-slate-200 font-serif rotate-180">"</span>
                    </div>
                  </div>
                )}

                {/* Metrics Row */}
                <div className="flex justify-center items-center gap-4 md:gap-16 mb-12 text-center w-full px-2 border-t border-b border-slate-100 py-8 max-w-3xl">
                  <div className="flex flex-col items-center border-r border-slate-200 pr-4 md:pr-16">
                    <p className="text-xs font-extrabold text-slate-400 flex items-center gap-1 mb-2 uppercase tracking-widest">
                      ⏱ Duration
                    </p>
                    <p className="text-3xl font-black text-slate-700">{stats.timeSpent}</p>
                  </div>

                  <div className="flex flex-col items-center border-r border-slate-200 pr-4 md:pr-16">
                    <p className="text-xs font-extrabold text-slate-400 flex items-center gap-1 mb-2 uppercase tracking-widest">
                      ✅ Correct
                    </p>
                    <p className="text-3xl font-black text-emerald-500">{stats.correct}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <p className="text-xs font-extrabold text-slate-400 flex items-center gap-1 mb-2 uppercase tracking-widest">
                      ❌ Incorrect
                    </p>
                    <p className="text-3xl font-black text-rose-500">{stats.incorrect}</p>
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
                  className="font-black text-xl px-12 py-5 rounded-2xl flex items-center gap-2 shadow-sm transition-all hover:scale-105 hover:shadow-md cursor-pointer border border-white/30"
                >
                  {aiFeedback?.buttonText || "Next Lesson ➔"}
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