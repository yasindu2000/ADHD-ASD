import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Game eke use karana sathunge emojis (ASD lamayi animals lata asai)
const ANIMAL_EMOJIS = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐸'];

function MemoryMatch() {
  const navigate = useNavigate();

  // --- GAME STATES ---
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- BEST SCORE STATE ---
  const [bestScore, setBestScore] = useState(0);
  const [bestTime, setBestTime] = useState("0:00");

  // 1. Fetch Best Score on Mount & Initialize Game
  useEffect(() => {
    const fetchBestScore = async () => {
      try {
        const studentId = localStorage.getItem('userId');
        if (studentId) {
          const res = await fetch(`http://localhost:5000/api/games/best-score/${studentId}/memory-match`);
          const data = await res.json();
          if (data.success) {
            setBestScore(data.bestScore);
            setBestTime(data.bestTime || "0:00");
          }
        }
      } catch (error) {
        console.error("Failed to fetch best score", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestScore();
    startNewGame();
  }, []);

  // 2. Timer Logic (Count UP - No pressure)
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

  // 3. Start a New Game (Shuffle cards)
  const startNewGame = () => {
    const shuffledEmojis = [...ANIMAL_EMOJIS, ...ANIMAL_EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffledEmojis);
    setFlippedCards([]);
    setMatchedPairs(0);
    setScore(0);
    setMoves(0);
    setTimer(0);
    setIsGameOver(false);
    setIsGameActive(true); // Start timer
  };

  // 4. Card Click Logic
  const handleCardClick = (index) => {
    // Prevent clicking if game is over, card is already matched/flipped, or 2 cards are already processing
    if (isGameOver || cards[index].isMatched || cards[index].isFlipped || flippedCards.length === 2) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    // If 2 cards are flipped, check for a match
    if (newFlippedCards.length === 2) {
      setMoves(m => m + 1);
      checkForMatch(newFlippedCards, newCards);
    }
  };

  const checkForMatch = (flippedIndexes, currentCards) => {
    const [firstIndex, secondIndex] = flippedIndexes;
    const isMatch = currentCards[firstIndex].emoji === currentCards[secondIndex].emoji;

    if (isMatch) {
      // It's a match!
      setTimeout(() => {
        const newCards = [...currentCards];
        newCards[firstIndex].isMatched = true;
        newCards[secondIndex].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);
        
        const newMatchedPairs = matchedPairs + 1;
        setMatchedPairs(newMatchedPairs);
        setScore(s => s + 10); // Give 10 points per pair

        // Check if game is won
        if (newMatchedPairs === ANIMAL_EMOJIS.length) {
          handleGameWin(score + 10, timer);
        }
      }, 500); // Small delay to see the match
    } else {
      // Not a match, flip back
      setTimeout(() => {
        const newCards = [...currentCards];
        newCards[firstIndex].isFlipped = false;
        newCards[secondIndex].isFlipped = false;
        setCards(newCards);
        setFlippedCards([]);
      }, 1000); // 1 second delay to memorize
    }
  };

  // 5. Game Win & Save to DB
  const handleGameWin = async (finalScore, finalTimeInSeconds) => {
    setIsGameOver(true);
    setIsGameActive(false); // Stop timer

    const timeString = formatTime(finalTimeInSeconds);
    const studentId = localStorage.getItem('userId');

    if (studentId) {
      try {
        const res = await fetch('http://localhost:5000/api/games/save-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            gameId: 'memory-match',
            currentScore: finalScore,
            timeTaken: timeString
          })
        });
        
        const data = await res.json();
        if (data.success && data.isNewBest) {
          setBestScore(data.bestScore);
          setBestTime(data.bestTime);
          toast.success("🎉 New High Score!", { icon: '🏆' });
        }
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }
  };


  if (loading) return <div className="min-h-screen bg-[#F4F8FB] flex items-center justify-center font-bold text-gray-500">Loading Game... 🌟</div>;

  return (
    <div className="min-h-screen bg-[#F4F8FB] font-sans pb-12 px-4 md:px-8">
      
      {/* 🌟 HEADER (Soft & Clear) */}
      <div className="max-w-4xl mx-auto pt-8 mb-8">
        <button 
          onClick={() => navigate('/games')}
          className="text-gray-500 hover:text-gray-800 font-bold flex items-center gap-2 mb-6 bg-white px-5 py-2 rounded-full shadow-sm w-fit transition-all"
        >
          <span className="text-xl">←</span> Games Hub
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-[#E1EDB0]">
          <div>
            <h1 className="text-3xl font-black text-[#1E3A8A]">Memory Match 🐢</h1>
            <p className="text-[#64748B] font-bold mt-1 text-sm">Find all the matching animal pairs!</p>
          </div>
          
          <div className="flex gap-4">
            {/* Best Score Badge */}
            <div className="bg-[#FEF3C7] px-4 py-2 rounded-xl border border-[#FDE68A] text-center">
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Best Score</p>
              <p className="text-xl font-black text-yellow-800">⭐ {bestScore} <span className="text-sm font-bold opacity-70">({bestTime})</span></p>
            </div>
            {/* Timer Badge */}
            <div className="bg-[#DBEAFE] px-4 py-2 rounded-xl border border-[#BFDBFE] text-center min-w-[90px]">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Time</p>
              <p className="text-xl font-black text-blue-800">⏱ {formatTime(timer)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 GAME BOARD AREA */}
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Current Game Stats */}
        <div className="flex justify-between w-full max-w-2xl px-4 mb-6">
          <p className="text-xl font-black text-gray-700">Score: <span className="text-[#03C734]">{score}</span></p>
          <p className="text-xl font-black text-gray-700">Moves: <span className="text-blue-500">{moves}</span></p>
        </div>

        {/* 🌟 THE CARDS GRID 🌟 */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-2xl perspective-1000">
          {cards.map((card, index) => (
            <div 
              key={card.id} 
              onClick={() => handleCardClick(index)}
              className={`relative w-full aspect-square rounded-2xl cursor-pointer transition-transform duration-500 transform-style-3d 
                ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''} 
                ${!card.isMatched && !card.isFlipped ? 'hover:scale-105 hover:shadow-md' : ''}
              `}
            >
              {/* BACK OF CARD (Hidden pattern) */}
              <div className={`absolute w-full h-full backface-hidden rounded-2xl bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] flex items-center justify-center border-4 border-white shadow-sm`}>
                <span className="text-4xl opacity-50 text-white">❓</span>
              </div>

              {/* FRONT OF CARD (Emoji) */}
              <div className={`absolute w-full h-full backface-hidden rounded-2xl flex items-center justify-center text-6xl md:text-7xl shadow-sm border-4 border-white rotate-y-180
                ${card.isMatched ? 'bg-[#D1FAE5] border-[#A7F3D0]' : 'bg-white'}
              `}>
                {card.emoji}
              </div>
            </div>
          ))}
        </div>

        {/* 🌟 GAME OVER SCREEN (Positive Reinforcement) */}
        {isGameOver && (
          <div className="mt-10 bg-white p-8 rounded-3xl shadow-lg border-2 border-green-200 text-center animate-in zoom-in w-full max-w-md">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">You Did It!</h2>
            <p className="text-lg font-bold text-gray-600 mb-6">
              You found all pairs in <b>{formatTime(timer)}</b>!
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
        )}

      </div>

      {/* Required CSS for 3D Flip effect */}
      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
}

export default MemoryMatch;