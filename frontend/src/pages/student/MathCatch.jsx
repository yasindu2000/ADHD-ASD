import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function MathCatch() {
  const navigate = useNavigate();
  const gameAreaRef = useRef(null);

  // --- GAME STATES ---
  const [basketPos, setBasketPos] = useState(50); 
  const basketPosRef = useRef(50); // 🌟 FIX: Mouse position eka loop ekata ganna ref eka

  const [apples, setApples] = useState([]);
  
  const [currentMath, setCurrentMath] = useState({ q: "2 + 2", a: 4 });
  const currentMathRef = useRef({ q: "2 + 2", a: 4 }); // 🌟 FIX: Math state for loop

  const [score, setScore] = useState(0);
  
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- BEST SCORE STATES ---
  const [bestScore, setBestScore] = useState(0);
  const [bestTime, setBestTime] = useState("0:00");

  const TARGET_SCORE = 100;
  const BASKET_WIDTH = 15; 

  // 1. Fetch Best Score
  useEffect(() => {
    const fetchBestScore = async () => {
      try {
        const studentId = localStorage.getItem('userId');
        if (studentId) {
          const res = await fetch(`http://localhost:5000/api/games/best-score/${studentId}/math-catch`);
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

  // 2. Timer Logic
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

  // 3. Generate Math Question
  const generateMath = useCallback(() => {
    const isAddition = Math.random() > 0.5;
    let num1, num2, answer;
    
    if (isAddition) {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 + num2;
    } else {
      num1 = Math.floor(Math.random() * 10) + 5;
      num2 = Math.floor(Math.random() * num1) + 1; 
      answer = num1 - num2;
    }
    
    const newMath = { q: isAddition ? `${num1} + ${num2}` : `${num1} - ${num2}`, a: answer };
    setCurrentMath(newMath);
    currentMathRef.current = newMath; // Update ref
    return answer;
  }, []);

  // 4. Spawn Apples
  const spawnApple = useCallback(() => {
    if (!isGameActive || isGameOver) return;

    setApples(prev => {
      if (prev.length >= 4) return prev; // Max 4 apples on screen

      const isCorrectAnswer = Math.random() < 0.4; // 40% chance to spawn correct
      let appleValue = isCorrectAnswer ? currentMathRef.current.a : currentMathRef.current.a + Math.floor(Math.random() * 7) - 3;
      
      if (!isCorrectAnswer && appleValue === currentMathRef.current.a) appleValue += 1;

      const newApple = {
        id: Math.random().toString(36).substr(2, 9),
        value: appleValue,
        left: Math.floor(Math.random() * 80) + 10,
        top: -10, // Start just above screen
      };
      return [...prev, newApple];
    });
  }, [isGameActive, isGameOver]);

  useEffect(() => {
    let spawnInterval;
    if (isGameActive && !isGameOver) {
      spawnInterval = setInterval(spawnApple, 2000); 
    }
    return () => clearInterval(spawnInterval);
  }, [isGameActive, isGameOver, spawnApple]);

  // 5. 🌟 FIX: Robust Game Loop (Falling physics) 🌟
  useEffect(() => {
    if (!isGameActive || isGameOver) return;

    const gameTick = setInterval(() => {
      setApples(prevApples => {
        let updatedApples = [];
        let caughtApple = null;
        
        for (let i = 0; i < prevApples.length; i++) {
          const apple = prevApples[i];
          const newTop = apple.top + 1.5; // Watena Vegaya (Falling Speed)

          const appleBottomEdge = newTop + 10;
          const currentBasketPos = basketPosRef.current; // Mouse inna thena
          
          // Collision Logic
          const isAtBasketHeight = appleBottomEdge >= 85 && appleBottomEdge <= 95;
          const isWithinBasketWidth = apple.left >= currentBasketPos - 5 && apple.left <= currentBasketPos + BASKET_WIDTH + 5;

          if (isAtBasketHeight && isWithinBasketWidth) {
            caughtApple = apple; // Caught!
            continue; // Bima watenna denne naha
          }

          if (newTop > 110) {
            continue; // Missed
          }

          updatedApples.push({ ...apple, top: newTop });
        }

        // Koodeta alluwama wenna oni de
        if (caughtApple) {
          setTimeout(() => handleCatch(caughtApple), 0);
        }

        return updatedApples;
      });
    }, 50); // Every 50ms loop runs (Smooth falling)

    return () => clearInterval(gameTick);
  }, [isGameActive, isGameOver]);

  // Handle catching an apple
  const handleCatch = (apple) => {
    if (apple.value === currentMathRef.current.a) {
      // CORRECT!
      setScore(s => {
        const newScore = s + 10;
        if (newScore >= TARGET_SCORE) {
          handleGameWin(newScore, timer);
        }
        return newScore;
      });
      generateMath(); 
      setApples([]); 
    } else {
      // WRONG!
      setScore(s => Math.max(0, s - 5));
      toast.error(`Oops! We need ${currentMathRef.current.a}`, {
        icon: '🍎',
        style: { borderRadius: '10px' },
      });
    }
  };

  // Mouse/Touch movement
  const handleMove = (e) => {
    if (!isGameActive || isGameOver || !gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    let clientX = e.clientX;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    }

    const xPos = clientX - rect.left;
    let percentage = (xPos / rect.width) * 100;
    
    percentage = Math.max(0, Math.min(percentage, 100 - BASKET_WIDTH));
    
    setBasketPos(percentage); // UI update karanawa
    basketPosRef.current = percentage; // Loop ekata update karanawa (🌟 FIX)
  };

  // 6. Start / Win
  const startNewGame = () => {
    setApples([]);
    setScore(0);
    setTimer(0);
    setIsGameOver(false);
    generateMath();
    setIsGameActive(true);
  };

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
            studentId, gameId: 'math-catch', currentScore: finalScore, timeTaken: timeString
          })
        });
        const data = await res.json();
        if (data.success && data.isNewBest) {
          setBestScore(data.bestScore);
          setBestTime(data.bestTime);
          toast.success("🍎 New High Score!", { icon: '🏆' });
        }
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F4F8FB] flex items-center justify-center font-bold text-gray-500">Loading Game... 🌟</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF2F8] to-[#F4F8FB] font-sans pb-12 px-4 md:px-8 overflow-hidden relative select-none">
      
      {/* 🌟 HEADER */}
      <div className="max-w-4xl mx-auto pt-8 mb-4 relative z-50">
        <button 
          onClick={() => navigate('/games')}
          className="text-pink-700 hover:text-pink-900 font-bold flex items-center gap-2 mb-6 bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm w-fit"
        >
          <span className="text-xl">←</span> Games Hub
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-pink-200">
          <div>
            <h1 className="text-3xl font-black text-pink-700">Math Catch 🍎</h1>
            {isGameActive && (
              <p className="text-gray-600 font-bold mt-2 text-lg flex items-center gap-2">
                Solve: <span className="text-3xl font-black text-[#1E3A8A] bg-blue-100 px-4 py-1 rounded-xl">{currentMath.q} = ?</span>
              </p>
            )}
          </div>
          
          <div className="flex gap-4">
            <div className="bg-[#FEF3C7] px-4 py-2 rounded-xl border border-[#FDE68A] text-center">
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Best</p>
              <p className="text-xl font-black text-yellow-800">⭐ {bestScore}</p>
            </div>
            <div className="bg-pink-100 px-4 py-2 rounded-xl border border-pink-300 text-center min-w-[90px]">
              <p className="text-xs font-bold text-pink-700 uppercase tracking-wider">Time</p>
              <p className="text-xl font-black text-pink-800">⏱ {formatTime(timer)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 GAME BOARD / PLAY AREA */}
      <div 
        ref={gameAreaRef}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        className="max-w-4xl mx-auto relative h-[65vh] bg-[#FCE7F3] rounded-[3rem] border-4 border-pink-200 shadow-inner overflow-hidden cursor-crosshair touch-none"
      >
        {isGameActive && (
          <div className="absolute top-6 left-6 right-6 flex justify-between z-40">
            <p className="text-xl font-black text-gray-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm">
              Score: <span className="text-[#03C734]">{score}</span> / {TARGET_SCORE}
            </p>
          </div>
        )}

        {/* 🍎 APPLES (Falling items) */}
        {isGameActive && apples.map((apple) => (
          <div
            key={apple.id}
            className="absolute flex flex-col items-center justify-center filter drop-shadow-md"
            style={{ left: `${apple.left}%`, top: `${apple.top}%`, transform: 'translateX(-50%)' }}
          >
            <span className="text-6xl md:text-7xl">🍎</span>
            <span className="absolute text-2xl font-black text-white drop-shadow-lg mt-3">
              {apple.value}
            </span>
          </div>
        ))}

        {/* 🧺 BASKET (Player controlled) */}
        {isGameActive && (
          <div 
            className="absolute bottom-4 h-24 flex items-center justify-center transition-transform duration-75"
            style={{ left: `${basketPos}%`, width: `${BASKET_WIDTH}%` }}
          >
            <div className="text-7xl md:text-8xl filter drop-shadow-xl z-50">🧺</div>
            <div className="absolute w-full h-4 bg-gray-900/20 rounded-full bottom-0 -z-10 blur-sm"></div>
          </div>
        )}

        {/* 🌟 GAME OVER SCREEN */}
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md z-50">
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border-4 border-pink-300 text-center animate-in zoom-in w-[90%] max-w-md">
              <div className="text-7xl mb-4">🏆</div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">Math Genius!</h2>
              <p className="text-lg font-bold text-gray-600 mb-6">
                You collected 100 points in <b>{formatTime(timer)}</b>!
              </p>
              <div className="flex justify-center gap-4 text-2xl font-black text-yellow-600 mb-8">
                <span>⭐ Score: {score}</span>
              </div>
              
              <button 
                onClick={startNewGame}
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-2xl font-black text-xl w-full shadow-[0_5px_15px_rgba(236,72,153,0.4)] transition-all hover:scale-105"
              >
                Play Again 🔄
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default MathCatch;