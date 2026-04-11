import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Soft Pastel Colors for ADHD/ASD friendliness
const COLORS = [
  { name: 'Red', hex: '#FCA5A5' },    // red-300
  { name: 'Blue', hex: '#93C5FD' },   // blue-300
  { name: 'Green', hex: '#86EFAC' },  // green-300
  { name: 'Yellow', hex: '#FDE047' }, // yellow-300
  { name: 'Purple', hex: '#D8B4FE' }  // purple-300
];

function BalloonPop() {
  const navigate = useNavigate();

  // --- GAME STATES ---
  const [balloons, setBalloons] = useState([]);
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [score, setScore] = useState(0);
  
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- BEST SCORE STATES ---
  const [bestScore, setBestScore] = useState(0);
  const [bestTime, setBestTime] = useState("0:00");

  const TARGET_GOAL = 10; // Udin pop karanna oni balloons gaana

  // 1. Fetch Best Score
  useEffect(() => {
    const fetchBestScore = async () => {
      try {
        const studentId = localStorage.getItem('userId');
        if (studentId) {
          const res = await fetch(`http://localhost:5000/api/games/best-score/${studentId}/balloon-pop`);
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

  // 3. Start Game
  const startNewGame = () => {
    setBalloons([]);
    setPoppedCount(0);
    setScore(0);
    setTimer(0);
    setIsGameOver(false);
    
    // Pick a random target color
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(randomColor);
    
    setIsGameActive(true);
  };

  // 4. Balloon Spawner
  const spawnBalloon = useCallback(() => {
    if (!isGameActive || isGameOver) return;

    const newBalloon = {
      id: Math.random().toString(36).substr(2, 9),
      colorObj: COLORS[Math.floor(Math.random() * COLORS.length)],
      left: Math.floor(Math.random() * 80) + 10, // 10% to 90% width
      duration: Math.floor(Math.random() * 4) + 6, // 6s to 10s float speed (calm speed)
    };

    setBalloons(prev => [...prev, newBalloon]);
  }, [isGameActive, isGameOver]);

  useEffect(() => {
    let spawnInterval;
    if (isGameActive && !isGameOver) {
      spawnInterval = setInterval(spawnBalloon, 1200); // Spawn every 1.2s
    }
    return () => clearInterval(spawnInterval);
  }, [isGameActive, isGameOver, spawnBalloon]);

  // 5. Handle Balloon Click 🌟 (UPDATE KARAPU THENA)
  const handlePop = (id, colorObj) => {
    if (!isGameActive || isGameOver) return;

    // Remove balloon from screen immediately
    setBalloons(prev => prev.filter(b => b.id !== id));

    // Check if it's the target color
    if (colorObj.name === targetColor.name) {
      setPoppedCount(prev => {
        const newPopped = prev + 1;
        
        setScore(s => {
          const newScore = s + 10; // +10 for correct
          // Check Win Condition
          if (newPopped >= TARGET_GOAL) {
            handleGameWin(newScore, timer);
          }
          return newScore;
        });

        return newPopped;
      });

    } else {
      // 🌟 WARADI BALLOON EKA OBUWOTH (-5 Points, but not below 0)
      setScore(s => Math.max(0, s - 5));
      
      // Podi notification ekak pennanawa target paata mathak karanna
      toast(`Oops! Catch the ${targetColor.name} ones!`, {
        icon: '🙈',
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#333',
          border: `2px solid ${targetColor.hex}`
        },
      });
    }
  };

  // 6. Remove balloon when animation ends (reaches top)
  const handleAnimationEnd = (id) => {
    setBalloons(prev => prev.filter(b => b.id !== id));
  };

  // 7. Win Game & Save Score
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
            studentId, gameId: 'balloon-pop', currentScore: finalScore, timeTaken: timeString
          })
        });
        const data = await res.json();
        if (data.success && data.isNewBest) {
          setBestScore(data.bestScore);
          setBestTime(data.bestTime);
          toast.success("🎈 New High Score!", { icon: '🏆' });
        }
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F4F8FB] flex items-center justify-center font-bold text-gray-500">Loading Game... 🌟</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F2FE] to-[#F4F8FB] font-sans pb-12 px-4 md:px-8 overflow-hidden relative">
      
      {/* HEADER (Always on top) */}
      <div className="max-w-4xl mx-auto pt-8 mb-8 relative z-50">
        <button 
          onClick={() => navigate('/games')}
          className="text-gray-500 hover:text-gray-800 font-bold flex items-center gap-2 mb-6 bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm w-fit"
        >
          <span className="text-xl">←</span> Games Hub
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-blue-100">
          <div>
            <h1 className="text-3xl font-black text-[#1E3A8A]">Balloon Pop 🎈</h1>
            {isGameActive && (
              <p className="text-gray-600 font-bold mt-2 text-lg">
                Pop all the <span style={{ color: targetColor.hex }} className="font-black text-xl px-2 bg-gray-100 rounded-lg">{targetColor.name}</span> balloons!
              </p>
            )}
          </div>
          
          <div className="flex gap-4">
            <div className="bg-[#FEF3C7] px-4 py-2 rounded-xl border border-[#FDE68A] text-center">
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Best</p>
              <p className="text-xl font-black text-yellow-800">⭐ {bestScore}</p>
            </div>
            <div className="bg-[#DBEAFE] px-4 py-2 rounded-xl border border-[#BFDBFE] text-center min-w-[90px]">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Time</p>
              <p className="text-xl font-black text-blue-800">⏱ {formatTime(timer)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* GAME BOARD / PLAY AREA */}
      <div className="max-w-4xl mx-auto relative h-[60vh] md:h-[65vh] bg-white/40 backdrop-blur-sm rounded-[3rem] border-4 border-white shadow-inner overflow-hidden">
        
        {/* Current Score & Progress */}
        {isGameActive && (
          <div className="absolute top-6 left-6 right-6 flex justify-between z-40 bg-white/80 px-6 py-3 rounded-2xl shadow-sm">
            <p className="text-xl font-black text-gray-700">Score: <span className="text-[#03C734]">{score}</span></p>
            <p className="text-xl font-black text-gray-700">Target: <span className="text-blue-500">{poppedCount} / {TARGET_GOAL}</span></p>
          </div>
        )}

        {/* BALLOONS */}
        {isGameActive && balloons.map((balloon) => (
          <div
            key={balloon.id}
            onAnimationEnd={() => handleAnimationEnd(balloon.id)}
            onClick={() => handlePop(balloon.id, balloon.colorObj)}
            className="absolute bottom-[-100px] cursor-pointer hover:scale-110 transition-transform balloon-animate"
            style={{
              left: `${balloon.left}%`,
              animationDuration: `${balloon.duration}s`,
            }}
          >
            {/* Balloon SVG Shape */}
            <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
              <path d="M30 60C46.5685 60 60 46.5685 60 30C60 13.4315 46.5685 0 30 0C13.4315 0 0 13.4315 0 30C0 46.5685 13.4315 60 30 60Z" fill={balloon.colorObj.hex}/>
              <path d="M25 60L30 65L35 60" fill={balloon.colorObj.hex}/>
              <path d="M30 65C30 70 35 75 25 80" stroke="gray" strokeWidth="2" fill="none"/>
              <ellipse cx="15" cy="20" rx="4" ry="10" transform="rotate(-30 15 20)" fill="white" fillOpacity="0.4"/>
            </svg>
          </div>
        ))}

        {/* GAME OVER SCREEN */}
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-md z-50">
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border-4 border-blue-200 text-center animate-in zoom-in w-[90%] max-w-md">
              <div className="text-7xl mb-4">🎈</div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">Great Job!</h2>
              <p className="text-lg font-bold text-gray-600 mb-6">
                You popped all the <b>{targetColor.name}</b> balloons in <b>{formatTime(timer)}</b>!
              </p>
              <div className="flex justify-center gap-4 text-2xl font-black text-yellow-600 mb-8">
                <span>⭐ Score: {score}</span>
              </div>
              
              <button 
                onClick={startNewGame}
                className="bg-[#03C734] hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-xl w-full shadow-[0_5px_15px_rgba(3,199,52,0.4)] transition-all hover:scale-105"
              >
                Play Again 🔄
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Balloon Animation CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-80vh) scale(1.1); opacity: 0; }
        }
        .balloon-animate {
          animation-name: floatUp;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}} />
    </div>
  );
}

export default BalloonPop;