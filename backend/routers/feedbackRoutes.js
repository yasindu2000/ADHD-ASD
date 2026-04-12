const express = require('express');
const router = express.Router();
const Feedback = require('../model/Feedback');

// 🌟 Teacher: Save Feedback to Database
router.post('/send', async (req, res) => {
  try {
    const { studentId, message, stars, date, teacherId } = req.body;
    
    const newFeedback = new Feedback({
      studentId,
      teacherId,
      message,
      stars,
      date: date ? new Date(date) : new Date() 
    });

    await newFeedback.save();
    res.status(200).json({ success: true, message: "Feedback saved to database successfully!" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🌟 Student: Get My Feedbacks
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const feedbacks = await Feedback.find({ studentId }).sort({ date: -1 });
    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;