import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function AddQuiz() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [quizId, setQuizId] = useState(null); // Edit mode ekata
  const [quizTitle, setQuizTitle] = useState('');
  const [date, setDate] = useState('');
  const [noOfQuestions, setNoOfQuestions] = useState(5);
  const [duration, setDuration] = useState('5 mins');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);

  // --- 1. GET QUIZ (Read if exists) ---
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/quizzes/lesson/${lessonId}`);
        const data = await res.json();
        if (data.success && data.quiz) {
          const q = data.quiz;
          setQuizId(q._id);
          setQuizTitle(q.quizTitle);
          setDate(q.date);
          setNoOfQuestions(q.noOfQuestions);
          setDuration(q.duration);
          setQuestions(q.questions);
        }
      } catch (error) {
        console.error("Fetch Error", error);
      }
    };
    fetchQuiz();
  }, [lessonId]);

  // --- Dynamic Handlers ---
  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleAddOption = (qIdx) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].options.push('');
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (qIdx, optIdx) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].options.splice(optIdx, 1);
    // If the deleted option was the correct answer, reset to 0
    if (newQuestions[qIdx].correctAnswer === optIdx) {
      newQuestions[qIdx].correctAnswer = 0;
    } else if (newQuestions[qIdx].correctAnswer > optIdx) {
      newQuestions[qIdx].correctAnswer -= 1;
    }
    setQuestions(newQuestions);
  };

  // --- 2. SAVE / UPDATE (Create & Update) ---
  const handlePublish = async () => {
    // Check validation
    if (!quizTitle || questions.some(q => !q.questionText || q.options.some(opt => !opt))) {
      toast.error("Please fill all fields and options!");
      return;
    }

    const method = quizId ? 'PUT' : 'POST';
    const url = quizId 
      ? `http://localhost:5000/api/quizzes/update/${quizId}` 
      : `http://localhost:5000/api/quizzes/add`;

    const payload = { 
      lessonId, 
      quizTitle, 
      date, 
      noOfQuestions, 
      duration, 
      questions 
    };

    try {
      const loadingToast = toast.loading("Saving Quiz...");
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(quizId ? "Quiz Updated! ✅" : "Quiz Published! 🚀", { id: loadingToast });
        navigate(-1);
      } else {
        toast.error("Backend Error: " + data.error, { id: loadingToast });
      }
    } catch (err) {
      toast.error("Failed to connect to server.");
    }
  };

  // --- 3. DELETE QUIZ ---
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this entire quiz?")) {
      const loadingToast = toast.loading("Deleting Quiz...");
      try {
        const res = await fetch(`http://localhost:5000/api/quizzes/delete/${quizId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          toast.success("Quiz Deleted Successfully", { id: loadingToast });
          navigate(-1);
        }
      } catch (err) {
        toast.error("Error deleting quiz", { id: loadingToast });
      }
    }
  };

  // --- UI COMPONENTS ---
  const BackButton = ({ onClick }) => (
    <button onClick={onClick} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-semibold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hover:shadow-md w-fit">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 font-sans min-h-screen">
      <div className="mb-8"><BackButton onClick={() => navigate(-1)} /></div>

      <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
        
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {quizId ? 'Edit Quiz Details' : 'Create New Quiz'}
          </h1>
          {quizId && (
            <button onClick={handleDelete} className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              Delete Quiz
            </button>
          )}
        </div>

        {/* General Settings */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-10 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">General Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-2">Quiz Title</label>
              <input type="text" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="e.g., Mathematics Mid-Term Evaluation" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Questions Limit</label>
                <select value={noOfQuestions} onChange={e => setNoOfQuestions(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm cursor-pointer">
                  {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Duration</label>
                <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm cursor-pointer">
                  <option value="5 mins">5 mins</option>
                  <option value="10 mins">10 mins</option>
                  <option value="15 mins">15 mins</option>
                  <option value="20 mins">20 mins</option>
                  <option value="30 mins">30 mins</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Loop */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">Questions Setup</h3>
          
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative group hover:border-blue-200 transition-all">
              
              {questions.length > 1 && (
                <button onClick={() => handleRemoveQuestion(qIdx)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-full p-2 border border-gray-200 hover:bg-red-50" title="Remove Question">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              )}

              <div className="flex items-center gap-3 mb-6">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">{qIdx + 1}</span>
                <div className="flex-1 mr-12">
                  <input 
                    type="text" 
                    placeholder="Type your question here..."
                    value={q.questionText} 
                    onChange={(e) => {
                      const newQ = [...questions];
                      newQ[qIdx].questionText = e.target.value;
                      setQuestions(newQ);
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                  />
                </div>
              </div>

              <div className="pl-11 space-y-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Answer Options (Select the correct one)</label>
                
                {q.options.map((opt, optIdx) => {
                  const isCorrect = q.correctAnswer === optIdx;
                  return (
                    <div key={optIdx} className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-transparent border-transparent hover:bg-gray-50'}`}>
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name={`correct-${qIdx}`} 
                          checked={isCorrect} 
                          onChange={() => {
                            const newQ = [...questions];
                            newQ[qIdx].correctAnswer = optIdx;
                            setQuestions(newQ);
                          }}
                          className="w-5 h-5 text-green-600 cursor-pointer focus:ring-green-500 border-gray-300"
                        />
                      </div>
                      
                      <div className="flex-1 flex items-center">
                        <span className="text-sm font-bold text-gray-400 w-6">{String.fromCharCode(65 + optIdx)}.</span>
                        <input 
                          type="text" 
                          placeholder={`Option ${optIdx + 1}`}
                          value={opt} 
                          onChange={(e) => {
                            const newQ = [...questions];
                            newQ[qIdx].options[optIdx] = e.target.value;
                            setQuestions(newQ);
                          }}
                          className={`flex-1 border ${isCorrect ? 'border-green-300 bg-white' : 'border-gray-200 bg-gray-50'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                        />
                      </div>

                      <button onClick={() => handleRemoveOption(qIdx, optIdx)} disabled={q.options.length <= 2} className={`p-2 rounded-lg transition-colors ${q.options.length <= 2 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`} title="Remove Option">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  );
                })}

                <button onClick={() => handleAddOption(qIdx)} className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 mt-2 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Another Option
                </button>
              </div>
            </div>
          ))}

          <button onClick={handleAddQuestion} className="w-full bg-blue-50 hover:bg-blue-100 border border-dashed border-blue-300 text-blue-600 font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 mt-4 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Add New Question
          </button>
        </div>

        <div className="h-px bg-gray-100 w-full my-8"></div>

        {/* Global Actions */}
        <div className="flex justify-end">
          <button 
            onClick={handlePublish} 
            className={`${quizId ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 'bg-green-600 hover:bg-green-700 shadow-green-500/30'} text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 text-lg flex items-center gap-2`}
          >
            {quizId ? (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Update Quiz</>
            ) : (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Publish Quiz</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default AddQuiz;