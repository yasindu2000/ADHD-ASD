const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  message: { 
    type: String, 
    required: true 
  },
  stars: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  date: { 
    type: Date, 
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);