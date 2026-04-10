// models/Lesson.js
const mongoose = require('mongoose');

// Part ekak athule thiyena data format eka
const lessonPartSchema = new mongoose.Schema({
  title: String,
  duration: String,
  videoUrl: String // ME FIELD EKA THIYENAWADA BALANNA 👇
});

const lessonSchema = new mongoose.Schema({
  grade: String,
  subject: String,
  title: String,
  date: String,
  coverImageUrl: String,
  parts: [lessonPartSchema], // ARRAY EKAK WIDIHATA DENNA
  teacherId: String
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);