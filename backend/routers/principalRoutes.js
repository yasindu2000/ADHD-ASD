const express = require('express');
const router = express.Router();
const User = require('../model/User');
const Progress = require('../model/StudentProgress');
const Lesson = require('../model/Lesson');
const Quiz = require('../model/Quiz');

// Get Principal Dashboard Stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    // 1. Get totals
    const totalStudents = await User.countDocuments({ role: 'student' }).catch(() => 0);
    const totalTeachers = await User.countDocuments({ role: 'teacher' }).catch(() => 0);

    // 2. Get all teachers details
    const teachers = await User.find({ role: 'teacher' }).select('fullName email phone createdAt');

    // 3. Get all students and aggregate their progress (lakunu/marks)
    const studentsRaw = await User.find({ role: 'student' }).select('fullName email grade createdAt');
    
    // We will map over students and calculate their total score/progress
    const allProgress = await Progress.find().populate('lessonId', 'title');

    const students = studentsRaw.map(student => {
      // Filter progress for this student
      const studentProgress = allProgress.filter(p => p.studentId && p.studentId.toString() === student._id.toString());
      
      let totalScore = 0;
      let completedLessons = 0;
      
      studentProgress.forEach(p => {
        if (p.isQuizCompleted && p.quizScore) {
          totalScore += p.quizScore;
        }
        if (p.completedParts && p.completedParts.length > 0) {
          completedLessons += 1;
        }
      });

      // Collect all dates the student had activity
      const activeDates = new Set();
      if (student.createdAt) {
        activeDates.add(new Date(student.createdAt).toISOString().split('T')[0]);
      }
      studentProgress.forEach(p => {
        if (p.updatedAt) {
          activeDates.add(p.updatedAt.toISOString().split('T')[0]);
        }
      });

      // Average score if they have completed quizzes
      const quizzesTaken = studentProgress.filter(p => p.isQuizCompleted).length;
      const averageScore = quizzesTaken > 0 ? Math.round(totalScore / quizzesTaken) : 0;

      return {
        _id: student._id,
        fullName: student.fullName,
        grade: student.grade,
        createdAt: student.createdAt,
        activeDates: Array.from(activeDates),
        totalScore,
        averageScore,
        completedLessons,
        quizzesTaken
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers
      },
      teachers,
      students
    });

  } catch (error) {
    console.error("Principal Dashboard Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
