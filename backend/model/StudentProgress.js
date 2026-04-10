const mongoose = require('mongoose');

const studentProgressSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Lamayage user ID eka
    required: true 
  },
  lessonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson', // Padame ID eka
    required: true 
  },
  completedParts: [{
    type: Number // Iwara karapu part index tika (e.g., [0, 1, 2])
  }],
  isQuizCompleted: { 
    type: Boolean, 
    default: false 
  },
  quizScore: { type: Number, default: 0 },         // Percentage (e.g., 80)
  correctAnswers: { type: Number, default: 0 },    // (e.g., 4)
  incorrectAnswers: { type: Number, default: 0 },  // (e.g., 1)
  timeTaken: { type: String, default: "0.00" }     // (e.g., "2.30")
}, { timestamps: true });

// Eka lamayekuta eka padamakata thiyenna puluwan eka progress record ekai
studentProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('StudentProgress', studentProgressSchema);