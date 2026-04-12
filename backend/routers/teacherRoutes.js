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
            const dateObj = new Date(prog.updatedAt);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); // 'Mon', 'Tue'..

            lessonViewsMap[dayName] = (lessonViewsMap[dayName] || 0) + 1;

            if (prog.isQuizCompleted && prog.quizScore !== undefined) {
                quizScoresMap[dayName] = (quizScoresMap[dayName] || 0) + prog.quizScore;
                quizCountsMap[dayName] = (quizCountsMap[dayName] || 0) + 1;
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
          .populate('studentId', 'fullName') // fullName එක ගන්නවා
          .populate('lessonId', 'title')
          .sort({ updatedAt: -1 })
          .limit(3);

        const recentGamesRaw = await GameProgress.find()
          .populate('studentId', 'fullName') // fullName එක ගන්නවා
          .sort({ lastPlayed: -1 })
          .limit(2);

        activity = [
          ...recentLessonsRaw.map(l => ({
            name: l.studentId?.fullName || 'Unknown Student',
            action: `finished a part in ${l.lessonId?.title || 'a Lesson'}`,
            icon: '📚',
            color: 'bg-blue-100 text-blue-600'
          })),
          ...recentGamesRaw.map(g => ({
            name: g.studentId?.fullName || 'Unknown Student',
            action: `played ${g.gameId} (Score: ${g.bestScore})`,
            icon: '🎮',
            color: 'bg-purple-100 text-purple-600'
          }))
        ];
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

    // Frontend Table එකට ඕන විදියට Data ටික Format කරනවා
    const formattedProgress = progress.map(p => {
      const dateObj = new Date(p.updatedAt);
      return {
        id: p._id,
        // Screenshot එකේ වගේ Date එක හදනවා (උදා: 2026/5/3)
        date: `${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
        // පාඩම සම්පූර්ණද නැද්ද බලනවා
        lessonStatus: p.completedParts && p.completedParts.length > 0 ? 'Completed' : 'Not Completed',
        quizStatus: p.isQuizCompleted ? 'Completed' : 'Not Completed',
        quizScore: p.quizScore ? `${p.quizScore}%` : '0%',
        quizTime: p.timeTaken ? `${p.timeTaken} min` : '0 min'
      };
    });

    res.status(200).json({ success: true, progress: formattedProgress });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;