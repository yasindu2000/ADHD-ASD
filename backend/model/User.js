const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["teacher", "student", "principal"], required: true },
  phone: { type: String }, // Only for teachers
  grade: { type: String }, // Only for students
  avatar: { type: String, default: "/avatars/avatar_lion_1784646383235.png" } // Profile picture
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);