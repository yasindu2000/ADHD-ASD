// routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const Quiz = require('../model/Quiz');

// 1. ADD QUIZ (Create)
router.post('/add', async (req, res) => {
  try {
    const newQuiz = new Quiz(req.body);
    await newQuiz.save();
    res.status(201).json({ success: true, quiz: newQuiz });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =================================================================
// 1. LESSON ID EKEN QUIZ EKA HOYANA ROUTE
// (Meken thama Lesson eka yatin "Start Quiz" button eka pennanne)
// =================================================================
router.get('/lesson/:lessonId', async (req, res) => {
  try {
    // Lesson ID ekata galapena quiz eka database eken hoyanawa
    const quizzes = await Quiz.find({ lessonId: req.params.lessonId });
    
    if (quizzes.length > 0) {
      res.status(200).json({ success: true, quiz: quizzes[0] });
    } else {
      res.status(404).json({ success: false, message: "No quiz found for this lesson" });
    }
  } catch (error) {
    console.error("Error fetching quiz by lesson:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// 2. QUIZ ID EKEN QUIZ EKA HOYANA ROUTE 
// (Meken thama button eka obapu gaman Quiz page eka athulata yanne)
// =================================================================
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id); 
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    res.status(200).json({ success: true, quiz });
  } catch (error) {
    console.error("Error fetching quiz by ID:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// 3. UPDATE QUIZ (Update)
router.put('/update/:id', async (req, res) => {
  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, quiz: updatedQuiz });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. DELETE QUIZ (Delete)
router.delete('/delete/:id', async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Quiz deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;