import { useState, useEffect } from 'react';

const AdditionGame = () => {
  const [num1, setNum1] = useState(1);
  const [num2, setNum2] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameMode, setGameMode] = useState('visual'); // 'visual' or 'numbers'
  const [showHint, setShowHint] = useState(false);
  
  // Generate new problem
  const generateProblem = () => {
    let max = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 20;
    let newNum1 = Math.floor(Math.random() * max) + 1;
    let newNum2 = Math.floor(Math.random() * max) + 1;
    
    // For difficulty 1, keep the sum under 10
    if (difficulty === 1 && newNum1 + newNum2 > 10) {
      newNum1 = Math.min(newNum1, 5);
      newNum2 = Math.min(newNum2, 10 - newNum1);
    }
    
    setNum1(newNum1);
    setNum2(newNum2);
    setUserAnswer('');
    setFeedback('');
    setShowHint(false);
  };
  
  // Initialize the game
  useEffect(() => {
    generateProblem();
  }, [difficulty, gameMode, generateProblem]);
  
  // Handle answer submission
  const checkAnswer = () => {
    const correctAnswer = num1 + num2;
    const userGuess = parseInt(userAnswer, 10);
    
    if (isNaN(userGuess)) {
      setFeedback('Please enter a number!');
      return;
    }
    
    if (userGuess === correctAnswer) {
      setFeedback('Great job! That\'s correct! 🎉');
      setScore(score + 1);
      setStreak(streak + 1);
      setShowConfetti(true);
      
      // After 1 second, hide confetti and generate new problem
      setTimeout(() => {
        setShowConfetti(false);
        generateProblem();
      }, 1500);
      
      // Increase difficulty when streak reaches certain points
      if (streak === 4 && difficulty === 1) {
        setDifficulty(2);
        setFeedback('Level up! Now try some bigger numbers!');
        setStreak(0);
      } else if (streak === 4 && difficulty === 2) {
        setDifficulty(3);
        setFeedback('Level up! You\'re doing great with these bigger numbers!');
        setStreak(0);
      }
    } else {
      setFeedback(`Not quite. Let's try again!`);
      setStreak(0);
      setShowHint(true);
    }
  };
  
  // Visual representation of numbers using circles
  const renderCircles = (number, color) => {
    const circles = [];
    for (let i = 0; i < number; i++) {
      circles.push(
        <div 
          key={i} 
          className={`w-8 h-8 rounded-full ${color} mx-1 inline-block`}
        />
      );
    }
    return circles;
  };
  
  return (
    <div className="p-6 max-w-lg mx-auto bg-blue-50 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Addition Fun!</h1>
      
      <div className="flex justify-center mb-4 space-x-4">
        <button 
          className={`px-4 py-2 rounded-full ${gameMode === 'visual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setGameMode('visual')}
        >
          Visual Mode
        </button>
        <button 
          className={`px-4 py-2 rounded-full ${gameMode === 'numbers' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setGameMode('numbers')}
        >
          Number Mode
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-inner mb-6">
        {/* Visual representation */}
        {gameMode === 'visual' && (
          <div className="flex flex-wrap justify-center items-center mb-4">
            <div className="flex flex-wrap justify-center">
              {renderCircles(num1, 'bg-red-400')}
            </div>
            <div className="text-2xl mx-2">+</div>
            <div className="flex flex-wrap justify-center">
              {renderCircles(num2, 'bg-blue-400')}
            </div>
            <div className="text-2xl mx-2">=</div>
            <div className="text-2xl">?</div>
          </div>
        )}
        
        {/* Number representation */}
        {gameMode === 'numbers' && (
          <div className="flex justify-center items-center mb-4">
            <div className="text-5xl font-bold text-red-500">{num1}</div>
            <div className="text-5xl mx-4">+</div>
            <div className="text-5xl font-bold text-blue-500">{num2}</div>
            <div className="text-5xl mx-4">=</div>
            <div className="text-5xl">?</div>
          </div>
        )}
        
        {/* Answer input */}
        <div className="flex justify-center mt-4">
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
            className="w-16 h-16 text-4xl text-center border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
            min="0"
          />
        </div>
        
        {/* Hint */}
        {showHint && (
          <div className="mt-4 text-center text-gray-600">
            Hint: Try counting all the objects together, or count up from {num1} by adding {num2} more.
          </div>
        )}
      </div>
      
      {/* Feedback */}
      <div className="text-center mb-4 h-8">
        <p className={`text-xl font-medium ${feedback.includes('correct') ? 'text-green-600' : feedback ? 'text-red-500' : ''}`}>
          {feedback}
        </p>
      </div>
      
      {/* Score display */}
      <div className="flex justify-between mb-6">
        <div className="text-lg">
          Score: <span className="font-bold">{score}</span>
        </div>
        <div className="text-lg">
          Streak: <span className="font-bold">{streak}</span>/5
        </div>
        <div className="text-lg">
          Level: <span className="font-bold">{difficulty}</span>
        </div>
      </div>
      
      {/* Check answer button */}
      <div className="flex justify-center">
        <button 
          onClick={checkAnswer}
          className="px-6 py-3 bg-green-500 text-white text-xl font-bold rounded-xl hover:bg-green-600 focus:outline-none transform transition hover:scale-105"
        >
          Check Answer
        </button>
      </div>
      
      {/* Confetti animation */}
      {showConfetti && (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 10 + 5;
            const left = Math.random() * 100;
            const animDuration = Math.random() * 3 + 2;
            const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            return (
              <div
                key={i}
                className={`absolute rounded-full ${color}`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  top: '-20px',
                  animation: `fall ${animDuration}s linear forwards`
                }}
              />
            );
          })}
        </div>
      )}
      
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AdditionGame;