const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  quizTitle: { type: String, required: true },
  date: { type: String },
  duration: { type: String },
  noOfQuestions: { type: Number },
  questions: [{
    questionText: String,
    options: [String],
    correctAnswer: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);