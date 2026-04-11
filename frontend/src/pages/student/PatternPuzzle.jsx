import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Soft, ASD friendly emojis
const EMOJIS = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐸', '🐢', '🦋', '🍎'];

// Pattern templates (0, 1, 2 represent distinct emojis)
const PATTERN_TEMPLATES = [
  [0, 1, 0, 1, 0],       // ABABA -> missing B (1)
  [0, 0, 1, 0, 0],       // AABAA -> missing B (1)
  [0, 1, 2, 0, 1],       // ABCAB -> missing C (2)
  [0, 1, 1, 0, 1],       // ABBAB -> missing B (1)
  [0, 0, 1, 1, 0]        // AABBA -> missing A (0)
];

function PatternPuzzle() {
  const navigate = useNavigate();

  // --- GAME STATES ---
  const [currentPattern, setCurrentPattern] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [options, setOptions] = useState([]);
  
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- BEST SCORE STATES ---
  const [bestScore, setBestScore] = useState(0);
  const [bestTime, setBestTime] = useState("0:00");

  const TOTAL_ROUNDS = 5; // Win karanna rounds 5k oni

  // 1. Fetch Best Score
  useEffect(() => {
    const fetchBestScore = async () => {
      try {
        const studentId = localStorage.getItem('userId');
        if (studentId) {
          const res = await fetch(`http://localhost:5000/api/games/best-score/${studentId}/pattern-puzzle`);
          const data = await res.json();
          if (data.success) {
            setBestScore(data.bestScore);
            setBestTime(data.bestTime || "0:00");
          }
        }
      } catch (error) {
        console.error("Failed to fetch score", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBestScore();
    startNewGame();
  }, []);

  // 2. Timer Logic (Count UP)
  useEffect(() => {
    let interval = null;
    if (isGameActive && !isGameOver) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isGameActive, isGameOver]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. Generate a Round
  const generateRound = useCallback(() => {
    // Pick 3 random distinct emojis
    const shuffledEmojis = [...EMOJIS].sort(() => 0.5 - Math.random());
    const selectedEmojis = shuffledEmojis.slice(0, 3);

    // Pick a random pattern template
    const template = PATTERN_TEMPLATES[Math.floor(Math.random() * PATTERN_TEMPLATES.length)];
    
    // Create the pattern sequence
    const sequence = template.map(num => selectedEmojis[num]);
    
    // Determine the next correct answer based on the template logic
    // We add the next logical number in the sequence
    let nextNum;
    if (template.join('') === '01010') nextNum = 1;      // ABABA -> B
    else if (template.join('') === '00100') nextNum = 1; // AABAA -> B
    else if (template.join('') === '01201') nextNum = 2; // ABCAB -> C
    else if (template.join('') === '01101') nextNum = 1; // ABBAB -> B
    else if (template.join('') === '00110') nextNum = 0; // AABBA -> A
    else nextNum = 0;

    const answer = selectedEmojis[nextNum];

    // Generate options (Correct answer + 2 random wrong answers)
    let optionSet = new Set([answer]);
    while(optionSet.size < 3) {
      const randomWrong = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      optionSet.add(randomWrong);
    }
    
    // Shuffle options
    const shuffledOptions = Array.from(optionSet).sort(() => 0.5 - Math.random());

    setCurrentPattern(sequence);
    setCorrectAnswer(answer);
    setOptions(shuffledOptions);
  }, []);

  // 4. Start Game
  const startNewGame = () => {
    setScore(0);
    setRound(1);
    setTimer(0);
    setIsGameOver(false);
    generateRound();
    setIsGameActive(true);
  };

  // 5. Handle Option Click
  const handleOptionClick = (selectedEmoji) => {
    if (!isGameActive || isGameOver) return;

    if (selectedEmoji === correctAnswer) {
      // CORRECT!
      const newScore = score + 10;
      setScore(newScore);

      if (round >= TOTAL_ROUNDS) {
        handleGameWin(newScore, timer);
      } else {
        setRound(r => r + 1);
        generateRound();
      }
    } else {
      // WRONG! (-5 penalty, don't go below 0)
      setScore(s => Math.max(0, s - 5));
      toast.error("Oops! Look at the pattern again.", {
        icon: '👀',
        style: { borderRadius: '10px', background: '#fff', color: '#333' },
      });
    }
  };

  // 6. Win Game & Save Score
  const handleGameWin = async (finalScore, finalTimeInSeconds) => {
    setIsGameOver(true);
    setIsGameActive(false);

    const timeString = formatTime(finalTimeInSeconds);
    const studentId = localStorage.getItem('userId');

    if (studentId) {
      try {
        const res = await fetch('http://localhost:5000/api/games/save-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId, gameId: 'pattern-puzzle', currentScore: finalScore, timeTaken: timeString
          })
        });
        const data = await res.json();
        if (data.success && data.isNewBest) {
          setBestScore(data.bestScore);
          setBestTime(data.bestTime);
          toast.success("🧩 New High Score!", { icon: '🏆' });
        }
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F4F8FB] flex items-center justify-center font-bold text-gray-500">Loading Game... 🌟</div>;

  return (
    <div className="min-h-screen bg-[#FEF9C3] font-sans pb-12 px-4 md:px-8 overflow-hidden relative">
      
      {/* 🌟 HEADER */}
      <div className="max-w-4xl mx-auto pt-8 mb-8 relative z-50">
        <button 
          onClick={() => navigate('/games')}
          className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-2 mb-6 bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm w-fit"
        >
          <span className="text-xl">←</span> Games Hub
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-amber-200">
          <div>
            <h1 className="text-3xl font-black text-amber-900">Pattern Puzzle 🧩</h1>
            <p className="text-amber-700 font-bold mt-2 text-lg">
              What comes next? Finish the pattern!
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-[#FEF3C7] px-4 py-2 rounded-xl border border-[#FDE68A] text-center">
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Best</p>
              <p className="text-xl font-black text-yellow-800">⭐ {bestScore}</p>
            </div>
            <div className="bg-amber-100 px-4 py-2 rounded-xl border border-amber-300 text-center min-w-[90px]">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Time</p>
              <p className="text-xl font-black text-amber-800">⏱ {formatTime(timer)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 GAME BOARD / PLAY AREA */}
      <div className="max-w-4xl mx-auto relative min-h-[50vh] bg-white rounded-[3rem] border-4 border-amber-100 shadow-sm flex flex-col items-center justify-center p-8">
        
        {isGameActive && (
          <div className="absolute top-6 left-6 right-6 flex justify-between">
            <p className="text-xl font-black text-gray-700 bg-gray-50 px-4 py-2 rounded-xl">Score: <span className="text-[#03C734]">{score}</span></p>
            <p className="text-xl font-black text-gray-700 bg-gray-50 px-4 py-2 rounded-xl">Round: <span className="text-amber-600">{round} / {TOTAL_ROUNDS}</span></p>
          </div>
        )}

        {isGameActive && (
          <div className="w-full flex flex-col items-center mt-10">
            
            {/* The Pattern Display */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-16 bg-amber-50 p-6 rounded-3xl border-2 border-amber-100 shadow-inner">
              {currentPattern.map((emoji, idx) => (
                <div key={idx} className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-2xl flex items-center justify-center text-5xl md:text-6xl shadow-sm border border-amber-200">
                  {emoji}
                </div>
              ))}
              {/* The Missing Piece (Question Mark) */}
              <div className="w-16 h-16 md:w-24 md:h-24 bg-amber-200 rounded-2xl flex items-center justify-center text-4xl md:text-5xl shadow-sm border-2 border-dashed border-amber-400 text-amber-600 font-black animate-pulse">
                ?
              </div>
            </div>

            {/* The Options */}
            <h3 className="text-2xl font-black text-gray-700 mb-6">Select the missing piece:</h3>
            <div className="flex gap-4 md:gap-8">
              {options.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(emoji)}
                  className="w-20 h-20 md:w-28 md:h-28 bg-white hover:bg-amber-100 rounded-[2rem] flex items-center justify-center text-5xl md:text-6xl shadow-md border-b-4 border-gray-200 hover:border-amber-300 hover:-translate-y-2 transition-all duration-200"
                >
                  {emoji}
                </button>
              ))}
            </div>

          </div>
        )}

        {/* 🌟 GAME OVER SCREEN */}
        {isGameOver && (
          <div className="animate-in zoom-in text-center">
            <div className="text-7xl mb-4">🧩</div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">Pattern Master!</h2>
            <p className="text-lg font-bold text-gray-600 mb-6">
              You solved all {TOTAL_ROUNDS} patterns in <b>{formatTime(timer)}</b>!
            </p>
            <div className="flex justify-center gap-4 text-2xl font-black text-yellow-600 mb-8">
              <span>⭐ Score: {score}</span>
            </div>
            
            <button 
              onClick={startNewGame}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-black text-xl w-full shadow-[0_5px_15px_rgba(245,158,11,0.4)] transition-all hover:scale-105"
            >
              Play Again 🔄
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default PatternPuzzle;