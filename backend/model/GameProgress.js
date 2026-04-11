const mongoose = require('mongoose');

const gameProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameId: { type: String, required: true }, // e.g., 'memory-match', 'balloon-pop'
  bestScore: { type: Number, default: 0 },
  bestTime: { type: String, default: "0:00" }, // Hodama welawa save karanna
  playCount: { type: Number, default: 0 },
  lastPlayed: { type: Date, default: Date.now }
});

// 🌟 MEKA THAMAI MISS WELA THIBBE
module.exports = mongoose.model('GameProgress', gameProgressSchema);