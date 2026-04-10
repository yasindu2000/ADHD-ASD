import React, { useState, useEffect } from 'react';
import { supabase } from '../../superbase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function AddLessons() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState('grades');
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [hasQuiz, setHasQuiz] = useState(false);

  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDate, setLessonDate] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [lessonParts, setLessonParts] = useState([{ id: Date.now(), title: '', duration: '5 mins', videoFile: null, videoUrl: '' }]);

  const [existingLessons, setExistingLessons] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const grades = [
    { id: '1', title: 'Grade 01', bg: 'bg-[#F28482] hover:bg-[#E56B69]' },
    { id: '2', title: 'Grade 02', bg: 'bg-[#F4F186] hover:bg-[#EAE665]' },
    { id: '3', title: 'Grade 03', bg: 'bg-[#84F2A6] hover:bg-[#6CE492]' },
    { id: '4', title: 'Grade 04', bg: 'bg-[#7EE8FA] hover:bg-[#5BDDF1]' },
    { id: '5', title: 'Grade 05', bg: 'bg-[#F998D6] hover:bg-[#F27CC5]' },
  ];

  const subjects = [
    { id: 'maths', title: 'Maths', topColor: 'bg-[#FFD1D1]', bottomColor: 'bg-[#FFBABA]', icon: '🧮' },
    { id: 'english', title: 'English', topColor: 'bg-[#FEF0A5]', bottomColor: 'bg-[#FCE679]', icon: 'ABC' },
    { id: 'tamil', title: 'Tamil', topColor: 'bg-[#B4F8C8]', bottomColor: 'bg-[#91F3AD]', icon: 'அ' },
    { id: 'environment', title: 'Environment', topColor: 'bg-[#CBEBFA]', bottomColor: 'bg-[#A8E1FA]', icon: '🌳' },
  ];

  // ==========================================
  // NEW: State Persistence (sessionStorage)
  // ==========================================
  
  // 1. Component eka load weddi kalin hitiya thana gannawa
  useEffect(() => {
    const savedState = sessionStorage.getItem('teacherDashboardState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setCurrentStep(parsed.currentStep || 'grades');
      setSelectedGrade(parsed.selectedGrade || null);
      setSelectedSubject(parsed.selectedSubject || null);
      setSelectedLesson(parsed.selectedLesson || null);
    }
  }, []);

  // 2. Step eka wenas weddi eka save karanawa
  useEffect(() => {
    sessionStorage.setItem('teacherDashboardState', JSON.stringify({
      currentStep,
      selectedGrade,
      selectedSubject,
      selectedLesson
    }));
  }, [currentStep, selectedGrade, selectedSubject, selectedLesson]);

  // 3. View Lesson ekata aawama auto Quiz eka check karanawa
  useEffect(() => {
    const checkQuizStatus = async () => {
      if (currentStep === 'viewLesson' && selectedLesson) {
        const lessonId = selectedLesson.id || selectedLesson._id;
        try {
          const res = await fetch(`http://localhost:5000/api/quizzes/lesson/${lessonId}`);
          const data = await res.json();
          setHasQuiz(data.success && data.quiz ? true : false);
        } catch (err) {
          setHasQuiz(false);
        }
      }
    };
    checkQuizStatus();
  }, [currentStep, selectedLesson]);

  // ==========================================

  useEffect(() => {
    const fetchLessons = async () => {
      if (currentStep === 'lessonList' && selectedGrade && selectedSubject) {
        try {
          const response = await fetch(`http://localhost:5000/api/lessons/get/${selectedGrade}/${selectedSubject.id}`);
          const data = await response.json();
          if (data.success) {
            const formattedLessons = data.lessons.map(l => ({
              id: l._id,
              title: l.title,
              date: l.date,
              img: l.coverImageUrl || 'https://placehold.co/300x150?text=Lesson',
              parts: l.parts.map(p => ({
                title: p.title,
                duration: p.duration,
                videoUrl: p.videoUrl
              }))
            }));
            setExistingLessons(formattedLessons);
          }
        } catch (error) {
          console.error("Error fetching lessons:", error);
        }
      }
    };
    fetchLessons();
  }, [currentStep, selectedGrade, selectedSubject]);

  const handleAddPart = () => {
    setLessonParts([...lessonParts, { id: Date.now(), title: '', duration: '5 mins', videoFile: null, videoUrl: '' }]);
  };

  const handleDeletePart = (idToRemove) => {
    if (lessonParts.length === 1) {
      toast.error("You must have at least one part!");
      return;
    }
    setLessonParts(lessonParts.filter(part => part.id !== idToRemove));
  };

  const handlePartChange = (id, field, value) => {
    setLessonParts(lessonParts.map(part => part.id === id ? { ...part, [field]: value } : part));
  };

  const openViewLesson = (lesson) => {
    setSelectedLesson(lesson);
    setCurrentStep('viewLesson');
    // Quiz check eka dan auto wena nisa methanin eka ain kala
  };

  const openAddForm = () => {
    setLessonTitle(''); setLessonDate(''); setCoverImage(null);
    setLessonParts([{ id: Date.now(), title: '', duration: '5 mins', videoFile: null, videoUrl: '' }]);
    setCurrentStep('addForm');
  };

  const openEditForm = () => {
    setLessonTitle(selectedLesson.title);
    setLessonDate(selectedLesson.date);
    const mappedParts = selectedLesson.parts.map(p => ({
      id: p._id || Date.now() + Math.random(),
      title: p.title,
      duration: p.duration,
      videoUrl: p.videoUrl,
      videoFile: null
    }));
    setLessonParts(mappedParts);
    setCurrentStep('editForm');
  };

  const handleDeleteLesson = async () => {
    const lessonId = selectedLesson.id || selectedLesson._id;
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/lessons/delete/${lessonId}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
          toast.success("Lesson deleted successfully!");
          setExistingLessons(existingLessons.filter(l => l.id !== lessonId));
          setCurrentStep('lessonList');
        }
      } catch (error) {
        toast.error("Error deleting lesson");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lessonTitle || !lessonDate || lessonParts.some(p => !p.title)) {
      toast.error("Please fill all required fields!");
      return;
    }
    setIsProcessing(true);
    const loadingToast = toast.loading("Processing lesson data...");

    try {
      let finalCoverUrl = selectedLesson?.img || '';
      if (coverImage) {
        const imageFileName = `${Date.now()}-${coverImage.name.replace(/\s+/g, '_')}`;
        await supabase.storage.from('images').upload(imageFileName, coverImage);
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(imageFileName);
        finalCoverUrl = publicUrl;
      }

      const partsWithVideoUrls = await Promise.all(lessonParts.map(async (part) => {
        let finalVideoUrl = part.videoUrl || '';
        if (part.videoFile) {
          const videoFileName = `${Date.now()}-${part.videoFile.name.replace(/\s+/g, '_')}`;
          await supabase.storage.from('videos').upload(videoFileName, part.videoFile);
          const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(videoFileName);
          finalVideoUrl = publicUrl;
        }
        return { title: part.title, duration: part.duration, videoUrl: finalVideoUrl };
      }));

      const isEdit = currentStep === 'editForm';
      const url = isEdit ? `http://localhost:5000/api/lessons/update/${selectedLesson.id}` : 'http://localhost:5000/api/lessons/add';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedGrade,
          subject: selectedSubject.id,
          title: lessonTitle,
          date: lessonDate,
          coverImageUrl: finalCoverUrl,
          parts: partsWithVideoUrls,
          teacherId: '60d0fe4f5311236168a109ca'
        })
      });
      const result = await response.json();

      if (result.success) {
        toast.success(isEdit ? "Lesson updated!" : "Lesson published!", { id: loadingToast });
        setCurrentStep('lessonList');
      }
    } catch (error) {
      toast.error("An error occurred!", { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- UI COMPONENTS ---
  const BackButton = ({ onClick }) => (
    <button onClick={onClick} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-semibold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hover:shadow-md w-fit">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back
    </button>
  );

  // ==========================================
  // VIEW 1: GRADES
  // ==========================================
  if (currentStep === 'grades') {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 font-sans min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight">Select Grade Level</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {grades.map(grade => (
            <div 
              key={grade.id} 
              onClick={() => { setSelectedGrade(grade.title); setCurrentStep('subjects'); }} 
              className={`${grade.bg} rounded-2xl p-8 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between border border-white/20`}
            >
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{grade.title}</h2>
              <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: SUBJECTS
  // ==========================================
  if (currentStep === 'subjects') {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 font-sans min-h-screen">
        <div className="mb-8"><BackButton onClick={() => setCurrentStep('grades')} /></div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight">{selectedGrade} Subjects</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map(sub => (
            <div 
              key={sub.id} 
              onClick={() => { setSelectedSubject(sub); setCurrentStep('lessonList'); }} 
              className="bg-white flex flex-col rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 group"
            >
              <div className={`h-40 flex items-center justify-center text-6xl ${sub.topColor} group-hover:opacity-90 transition-opacity`}>
                {sub.icon}
              </div>
              <div className={`py-4 text-center ${sub.bottomColor}`}>
                <h3 className="text-xl font-bold text-gray-800 tracking-tight">{sub.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: LESSONS LIST
  // ==========================================
  if (currentStep === 'lessonList') {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 font-sans min-h-screen relative">
        <div className="flex items-center justify-between mb-8">
          <BackButton onClick={() => setCurrentStep('subjects')} />
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Manage Lessons</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {existingLessons.map(lesson => (
            <div 
              key={lesson.id} 
              onClick={() => openViewLesson(lesson)} 
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300 group flex flex-col"
            >
              <div className="h-48 overflow-hidden relative">
                <img src={lesson.img} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{lesson.title}</h3>
                <p className="text-sm text-gray-400 mt-3 font-medium">{lesson.date || "No Date"}</p>
              </div>
            </div>
          ))}
          {existingLessons.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <span className="text-6xl mb-4">📚</span>
              <p className="text-gray-500 text-lg font-medium">No lessons available yet.</p>
              <p className="text-gray-400 text-sm mt-1">Click the + button to create the first lesson.</p>
            </div>
          )}
        </div>

        <button 
          onClick={openAddForm} 
          className="fixed bottom-10 right-10 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-3xl shadow-lg hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 z-50"
          title="Add New Lesson"
        >
          +
        </button>
      </div>
    );
  }

  // ==========================================
  // VIEW 4: VIEW LESSON DETAILS
  // ==========================================
  if (currentStep === 'viewLesson') {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 font-sans min-h-screen">
        <div className="mb-8"><BackButton onClick={() => setCurrentStep('lessonList')} /></div>

        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 relative">
          {/* Top Actions */}
          <div className="absolute top-6 right-6 flex gap-3">
            <button onClick={openEditForm} className="w-10 h-10 bg-gray-50 hover:bg-blue-50 text-blue-600 rounded-full flex items-center justify-center transition-colors shadow-sm border border-gray-100" title="Edit">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
            <button onClick={handleDeleteLesson} className="w-10 h-10 bg-gray-50 hover:bg-red-50 text-red-500 rounded-full flex items-center justify-center transition-colors shadow-sm border border-gray-100" title="Delete">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight pr-24">{selectedLesson.title}</h1>
          <p className="text-gray-400 font-medium mb-8 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            {selectedLesson.date || "No Date Assigned"}
          </p>

          <div className="space-y-4">
            {selectedLesson.parts.map((part, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-4 flex items-center gap-5 border border-gray-100 hover:border-gray-200 transition-colors">
                {/* Video Preview */}
                <div className="w-32 h-20 bg-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner">
                  {part.videoUrl ? (
                    <>
                      <video className="w-full h-full object-cover opacity-50"><source src={part.videoUrl} type="video/mp4" /></video>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center pl-1 border border-white/50">
                           <span className="text-white text-xs">▶</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">No Video</span>
                  )}
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-gray-800">{part.title || `Part ${index + 1}`}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-sm font-medium text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-sm">
                      🕒 {part.duration}
                    </span>
                    {part.videoUrl && (
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md font-semibold border border-green-100 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Button */}
        <div className="flex justify-center mt-8">
          <button 
            onClick={() => navigate(`/teacher/add-quiz/${selectedLesson.id || selectedLesson._id}`)} 
            className={`${hasQuiz ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'} text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-center gap-2`}
          >
            {hasQuiz ? (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> View / Edit Quiz</>
            ) : (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg> Create Quiz</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 5: ADD / EDIT FORM
  // ==========================================
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 font-sans min-h-screen">
      <div className="mb-8"><BackButton onClick={() => currentStep === 'editForm' ? setCurrentStep('viewLesson') : setCurrentStep('lessonList')} /></div>
      
      <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight border-b border-gray-100 pb-4">
          {currentStep === 'editForm' ? 'Edit Lesson' : 'Create New Lesson'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* General Information Section */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-700">General Information</h3>
            
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Lesson Title</label>
                <input type="text" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder="e.g., Introduction to Algebra" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Cover Image</label>
                  <label className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 cursor-pointer flex justify-between items-center hover:bg-gray-100 transition-colors focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                    <span className="truncate mr-2">{coverImage ? coverImage.name : "Select an image..."}</span>
                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <input type="file" accept="image/*" onChange={e => setCoverImage(e.target.files[0])} className="hidden" />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Published Date</label>
                  <input type="date" value={lessonDate} onChange={e => setLessonDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full my-6"></div>

          {/* Video Parts Section */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-700">Lesson Parts</h3>
            
            {lessonParts.map((part, index) => (
              <div key={part.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 relative group transition-all hover:border-blue-200 hover:shadow-sm">
                
                {lessonParts.length > 1 && (
                  <button type="button" onClick={() => handleDeletePart(part.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-1.5 shadow-sm border border-gray-100" title="Remove Part">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                )}

                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">{index + 1}</span>
                  Video Segment
                </h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Part Title</label>
                    <input type="text" value={part.title} onChange={e => handlePartChange(part.id, 'title', e.target.value)} placeholder="e.g., Chapter 1: Basics" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Duration</label>
                      <select value={part.duration} onChange={e => handlePartChange(part.id, 'duration', e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer">
                        <option value="5 mins">5 mins</option>
                        <option value="10 mins">10 mins</option>
                        <option value="15 mins">15 mins</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Video File</label>
                      <label className={`w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-all ${part.videoFile ? 'border-green-400 bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50 hover:border-gray-400'}`}>
                        <span className="truncate mr-2 font-medium">
                          {part.videoFile ? "File Selected ✓" : "Upload Video..."}
                        </span>
                        <svg className={`w-5 h-5 shrink-0 ${part.videoFile ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <input type="file" accept="video/*" onChange={e => handlePartChange(part.id, 'videoFile', e.target.files[0])} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" onClick={handleAddPart} className="w-full bg-blue-50 hover:bg-blue-100 border border-dashed border-blue-300 text-blue-600 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              Add Another Part
            </button>
          </div>

          <div className="pt-6">
            <button type="submit" disabled={isProcessing} className={`w-full font-bold py-4 rounded-xl text-white shadow-lg text-lg transition-all hover:-translate-y-0.5 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''} ${currentStep === 'editForm' ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30' : 'bg-green-600 hover:bg-green-700 hover:shadow-green-500/30'}`}>
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </span>
              ) : (currentStep === 'editForm' ? 'Update Lesson' : 'Publish Lesson')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddLessons;