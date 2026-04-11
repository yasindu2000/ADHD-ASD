// routes/lessonRoutes.js
const express = require('express');
const router = express.Router();
const Lesson = require('../model/Lesson');
const StudentProgress = require('../model/StudentProgress'); 
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ==========================================
// 1. PROGRESS ROUTES (MEWA UDINMA THIYENNA ONI)
// ==========================================
const genAI = new GoogleGenerativeAI("AIzaSyBfX1YsPJfIn0QIMGe7Dj-KmiXTgGBM-NU");

// AI ANALYSIS ROUTE
router.post('/analyze-quiz', async (req, res) => {
  const { score, correct, incorrect, timeSpent } = req.body;
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // AI ekata dena command eka (Prompt)
    const prompt = `You are an expert AI tutor. A student just finished a quiz.
    Score: ${score}%
    Correct Answers: ${correct}
    Incorrect Answers: ${incorrect}
    Time Spent: ${timeSpent} minutes.

    Analyze this student's performance and respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
    {
      "action": "NEXT_LESSON" or "REVISE_QUIZ" or "REVISE_LESSON",
      "message": "Write a very short, encouraging 1-sentence feedback for the student.",
      "buttonText": "Next Lesson →" or "Revise Quiz 🔄" or "Revise Lesson 📚",
      "color": "#059669" if action is NEXT_LESSON, "#D9F70D" if REVISE_QUIZ, "#EF4444" if REVISE_LESSON
    }
    
    Rules for action:
    - If score >= 70, action is NEXT_LESSON.
    - If score >= 40 and score < 70, action is REVISE_QUIZ.
    - If score < 40, action is REVISE_LESSON.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up the response to ensure it's valid JSON
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiAnalysis = JSON.parse(jsonStr);

    res.status(200).json({ success: true, analysis: aiAnalysis });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// SAVE PROGRESS (POST)
router.post('/progress', async (req, res) => {
  const { studentId, lessonId, partIndex } = req.body;

  try {
    let progress = await StudentProgress.findOne({ studentId, lessonId });

    if (!progress) {
      progress = new StudentProgress({
        studentId,
        lessonId,
        completedParts: [partIndex]
      });
    } else {
      if (!progress.completedParts.includes(partIndex)) {
        progress.completedParts.push(partIndex);
      }
    }

    await progress.save();
    res.status(200).json({ success: true, progress });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET PROGRESS FOR A SPECIFIC LESSON
// GET STUDENT PROGRESS (Videos & Quiz)
router.get('/progress/:studentId/:lessonId', async (req, res) => {
  try {
    const progress = await StudentProgress.findOne({
      studentId: req.params.studentId,
      lessonId: req.params.lessonId
    });

    if (progress) {
      // 🌟 FIX: completedParts witarak nemei, full progress object ekama yawanawa!
      res.status(200).json({ 
        success: true, 
        progress: progress, // Meke athule isQuizCompleted, quizScore okkoma thiyenawa
        completedParts: progress.completedParts 
      });
    } else {
      res.status(200).json({ success: true, completedParts: [], progress: null });
    }
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// GET ALL PROGRESS FOR A STUDENT
router.get('/all-progress/:studentId', async (req, res) => {
  try {
    const allProgress = await StudentProgress.find({ studentId: req.params.studentId });
    res.status(200).json({ success: true, allProgress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SAVE QUIZ SCORE (POST) - lessonRoutes.js eke danna
router.post('/quiz-score', async (req, res) => {
  const { studentId, lessonId, score, correct, incorrect, timeTaken } = req.body;
  try {
    const progress = await StudentProgress.findOneAndUpdate(
      { studentId, lessonId },
      { 
        isQuizCompleted: true, 
        quizScore: score,
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        timeTaken: timeTaken 
      },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// ==========================================
// 2. LESSON CRUD ROUTES (PALLEHAIN THIYENNA ONI)
// ==========================================

// ADD NEW LESSON (POST)
router.post('/add', async (req, res) => {
  try {
    const { grade, subject, title, date, coverImageUrl, parts, teacherId } = req.body;

    const newLesson = new Lesson({
      grade,
      subject,
      title,
      date,
      coverImageUrl,
      parts,
      teacherId
    });

    const savedLesson = await newLesson.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Lesson added successfully!', 
      lesson: savedLesson 
    });

  } catch (error) {
    console.error('Error adding lesson:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET LESSONS BY GRADE AND SUBJECT (GET)
router.get('/get/:grade/:subject', async (req, res) => {
  try {
    const { grade, subject } = req.params;
    
    const lessons = await Lesson.find({ 
      grade: { $regex: new RegExp(`^${grade}$`, 'i') }, 
      subject: { $regex: new RegExp(`^${subject}$`, 'i') } 
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE LESSON (PUT)
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, coverImageUrl, parts } = req.body;

    const updatedLesson = await Lesson.findByIdAndUpdate(
      id,
      { title, date, coverImageUrl, parts },
      { new: true } 
    );

    if (!updatedLesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.status(200).json({ success: true, lesson: updatedLesson });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE LESSON (DELETE)
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLesson = await Lesson.findByIdAndDelete(id);

    if (!deletedLesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.status(200).json({ success: true, message: 'Lesson deleted successfully! 🗑️' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET SINGLE LESSON BY ID (GET) - MEKA ANTHIMATA THIYENNA ONI
router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.status(200).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET STUDENT DASHBOARD STATS
router.get('/dashboard-stats/:studentId', async (req, res) => {
  try {
    // Lamayage progress okkoma gannawa, eka ekka Lesson eke title ekath gannawa (populate)
    const progressData = await StudentProgress.find({ studentId: req.params.studentId })
      .populate('lessonId', 'title subjectName')
      .sort({ updatedAt: 1 }); // Parana eke idan aluth ekata sort karanawa graph eke pennanna

    res.status(200).json({ success: true, progress: progressData });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;