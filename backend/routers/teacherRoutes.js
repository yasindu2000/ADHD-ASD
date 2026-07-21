const express = require('express');
const router = express.Router();
const User = require('../model/User');
const Lesson = require('../model/Lesson');
const Quiz = require('../model/Quiz');
const Progress = require('../model/StudentProgress'); 
const GameProgress = require('../model/GameProgress'); 

router.get('/dashboard-stats', async (req, res) => {
  try {
    // 1. Basic Stats 
    const totalStudents = await User.countDocuments({ role: 'student' }).catch(() => 0);
    const totalLessons = await Lesson.countDocuments().catch(() => 0);
    const totalQuizzes = await Quiz.countDocuments().catch(() => 0);

    // 🌟 FIX 1: Current Week Logic (Student Dashboard එකේ විදියටම)
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); 
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1); // මේ සතියේ සඳුදා

    let lessonViewsMap = {};
    let quizScoresMap = {};
    let quizCountsMap = {};

    try {
        // මේ සතියේ සඳුදා ඉඳන් තියෙන Data විතරක් ගන්නවා
        const thisWeekProgress = await Progress.find({
            updatedAt: { $gte: startOfWeek }
        }) || [];

        thisWeekProgress.forEach(prog => {
            // LESSON VIEWS
            if (prog.lessonViews && prog.lessonViews.length > 0) {
               prog.lessonViews.forEach(view => {
                  const dateObj = new Date(view.date);
                  if (dateObj >= startOfWeek) {
                      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                      lessonViewsMap[dayName] = (lessonViewsMap[dayName] || 0) + 1;
                  }
               });
            } else {
               const dateObj = new Date(prog.updatedAt);
               if (dateObj >= startOfWeek) {
                   const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                   lessonViewsMap[dayName] = (lessonViewsMap[dayName] || 0) + 1;
               }
            }

            // QUIZ SCORES
            if (prog.quizAttempts && prog.quizAttempts.length > 0) {
               prog.quizAttempts.forEach(attempt => {
                  const dateObj = new Date(attempt.date);
                  if (dateObj >= startOfWeek) {
                      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                      quizScoresMap[dayName] = (quizScoresMap[dayName] || 0) + attempt.score;
                      quizCountsMap[dayName] = (quizCountsMap[dayName] || 0) + 1;
                  }
               });
            } else if (prog.isQuizCompleted && prog.quizScore !== undefined) {
               const dateObj = new Date(prog.updatedAt);
               if (dateObj >= startOfWeek) {
                   const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                   quizScoresMap[dayName] = (quizScoresMap[dayName] || 0) + prog.quizScore;
                   quizCountsMap[dayName] = (quizCountsMap[dayName] || 0) + 1;
               }
            }
        });
    } catch (e) {
        console.log("⚠️ Progress Data Error:", e.message);
    }

    // 🌟 FIX 2: Weekdays විතරක් ගන්නවා (Mon - Fri)
    const weekdaysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    const lessonChart = weekdaysOrder.map(day => ({
        day: day,
        views: lessonViewsMap[day] || 0
    }));

    const quizChart = weekdaysOrder.map(day => ({
        day: day,
        score: quizCountsMap[day] ? Math.round(quizScoresMap[day] / quizCountsMap[day]) : 0
    }));

    // 🌟 FIX 3: ළමයාගේ නම ගන්න 'fullName' පාවිච්චි කරනවා
    let activity = [];
    try {
        const recentLessonsRaw = await Progress.find()
          .populate('studentId', 'fullName')
          .populate('lessonId', 'title')
          .sort({ updatedAt: -1 })
          .limit(50); // Increased limit for View All

        const recentGamesRaw = await GameProgress.find()
          .populate('studentId', 'fullName')
          .sort({ lastPlayed: -1 })
          .limit(50); // Increased limit for View All

        activity = [
          ...recentLessonsRaw.map(l => ({
            id: l._id,
            name: l.studentId?.fullName || 'Unknown Student',
            action: `finished a part in ${l.lessonId?.title || 'a Lesson'}`,
            icon: '📚',
            color: 'bg-blue-100 text-blue-600',
            date: l.updatedAt
          })),
          ...recentGamesRaw.map(g => ({
            id: g._id,
            name: g.studentId?.fullName || 'Unknown Student',
            action: `played ${g.gameId} (Score: ${g.bestScore})`,
            icon: '🎮',
            color: 'bg-purple-100 text-purple-600',
            date: g.lastPlayed
          }))
        ];

        // Sort combined activity by date descending
        activity.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) {
        console.log("⚠️ Activity Fetch Error:", e.message);
    }

    res.status(200).json({
      success: true,
      stats: { totalStudents, totalLessons, totalQuizzes },
      lessonChart,
      quizChart,
      recentActivity: activity
    });

  } catch (error) {
    console.error("❌ BACKEND ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// teacherRoutes.js එකේ යටින් මේක දාන්න (module.exports = router; එකට උඩින්)

// 🌟 Get all students for the Feedback Page
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🌟 Get Specific Student's Progress for the Table
router.get('/student-progress/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // ළමයාගේ ඔක්කොම progress ටික අරන් අලුත්ම එක උඩින් එන්න sort කරනවා
    const progress = await Progress.find({ studentId })
      .populate('lessonId', 'title')
      .sort({ updatedAt: -1 });

    // 🌟 FIX: Activity Log Format (Extract every single view and quiz attempt)
    let activities = [];

    progress.forEach(p => {
       const lessonTitle = p.lessonId?.title || "Unknown Lesson";
       
       if (p.lessonViews && p.lessonViews.length > 0) {
           p.lessonViews.forEach((view, idx) => {
               const dateObj = new Date(view.date);
               
               // Check if this is the last view and if the lesson has any completed parts
               const isLastView = idx === p.lessonViews.length - 1;
               const isCompleted = p.completedParts && p.completedParts.length > 0;

               activities.push({
                   id: p._id.toString() + '_view_' + idx,
                   rawDate: dateObj,
                   date: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`,
                   time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                   type: 'Lesson View',
                   title: lessonTitle,
                   status: (isLastView && isCompleted) ? 'Completed' : 'Viewed',
                   score: '-',
                   timeTaken: '-'
               });
           });
       } else {
           // Fallback: If they have a progress document but no logged views, use createdAt
           const dateObj = new Date(p.createdAt || p.updatedAt);
           const isCompleted = p.completedParts && p.completedParts.length > 0;
           
           activities.push({
               id: p._id.toString() + '_view_fallback',
               rawDate: dateObj,
               date: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`,
               time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
               type: 'Lesson View',
               title: lessonTitle,
               status: isCompleted ? 'Completed' : 'Started',
               score: '-',
               timeTaken: '-'
           });
       }

       if (p.quizAttempts && p.quizAttempts.length > 0) {
           p.quizAttempts.forEach((attempt, idx) => {
               const dateObj = new Date(attempt.date);
               activities.push({
                   id: p._id.toString() + '_quiz_' + idx,
                   rawDate: dateObj,
                   date: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`,
                   time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                   type: 'Quiz Attempt',
                   title: lessonTitle,
                   status: 'Attempted',
                   score: attempt.score !== undefined ? `${attempt.score}%` : '0%',
                   timeTaken: p.timeTaken ? `${p.timeTaken} min` : '-'
               });
           });
       }
    });

    // Sort all activities from newest to oldest
    activities.sort((a, b) => b.rawDate - a.rawDate);

    res.status(200).json({ success: true, progress: activities });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;