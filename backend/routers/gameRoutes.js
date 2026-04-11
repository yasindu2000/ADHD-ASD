const express = require('express');
const router = express.Router();

// Model eka import karanawa
const GameProgress = require('../model/GameProgress');

// 1. Get Best Score for a game
router.get('/best-score/:studentId/:gameId', async (req, res) => {
  try {
    const { studentId, gameId } = req.params;
    const progress = await GameProgress.findOne({ studentId, gameId });
    res.status(200).json({ success: true, bestScore: progress ? progress.bestScore : 0, bestTime: progress ? progress.bestTime : "0:00" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Save/Update Score
router.post('/save-score', async (req, res) => {
  try {
    const { studentId, gameId, currentScore, timeTaken } = req.body;
    
    let progress = await GameProgress.findOne({ studentId, gameId });
    
    if (progress) {
      progress.playCount += 1;
      progress.lastPlayed = Date.now();
      
      // Aluth score eka kalin ekata wada wadi nam witarak bestScore eka update karanawa
      if (currentScore > progress.bestScore) {
        progress.bestScore = currentScore;
        progress.bestTime = timeTaken;
      }
      await progress.save();
    } else {
      progress = new GameProgress({
        studentId, gameId, bestScore: currentScore, bestTime: timeTaken, playCount: 1
      });
      await progress.save();
    }

    res.status(200).json({ success: true, bestScore: progress.bestScore, bestTime: progress.bestTime, isNewBest: currentScore >= progress.bestScore });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🌟 ME LINE EKA NATHNAM THAMAI ARA ERROR EKA ENNE
module.exports = router;