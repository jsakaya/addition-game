import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'confetti-js';

interface GameState {
  num1: number;
  num2: number;
  options: number[];
  score: number;
  streak: number;
  level: number;
  isVisualMode: boolean;
}

function App() {
  const [gameState, setGameState] = useState<GameState>({
    num1: 0,
    num2: 0,
    options: [],
    score: 0,
    streak: 0,
    level: 1,
    isVisualMode: true,
  });

  useEffect(() => {
    generateNewProblem();
    
    // Initialize confetti
    const confettiSettings = { target: 'confetti-canvas', max: 80, size: 1.5, animate: true };
    const confettiInstance = new confetti.create('confetti-canvas', confettiSettings);
    return () => confettiInstance.clear();
  }, []);

  const generateNewProblem = () => {
    const maxNum = Math.min(5 + gameState.level * 2, 20);
    const num1 = Math.floor(Math.random() * maxNum) + 1;
    const num2 = Math.floor(Math.random() * maxNum) + 1;
    const correctAnswer = num1 + num2;
    
    // Generate wrong options
    let options = [correctAnswer];
    while (options.length < 4) {
      const wrongAnswer = correctAnswer + Math.floor(Math.random() * 5) * (Math.random() < 0.5 ? 1 : -1);
      if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    options = options.sort(() => Math.random() - 0.5);

    setGameState(prev => ({
      ...prev,
      num1,
      num2,
      options,
    }));
  };

  const handleAnswer = (answer: number) => {
    const correctAnswer = gameState.num1 + gameState.num2;
    if (answer === correctAnswer) {
      // Trigger confetti
      const confettiInstance = new confetti.create('confetti-canvas', { target: 'confetti-canvas' });
      confettiInstance.render();
      setTimeout(() => confettiInstance.clear(), 2500);

      // Update score and streak
      setGameState(prev => ({
        ...prev,
        score: prev.score + 10,
        streak: prev.streak + 1,
        level: prev.streak >= 4 ? prev.level + 1 : prev.level,
      }));
      generateNewProblem();
    } else {
      setGameState(prev => ({ ...prev, streak: 0 }));
    }
  };

  const Circle = ({ color }: { color: string }) => (
    <motion.div
      className={`w-8 h-8 rounded-full ${color} m-1`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  );

  return (
    <div className="min-h-screen bg-background p-4 relative">
      <canvas id="confetti-canvas" className="fixed inset-0 pointer-events-none z-50" />
      
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">Addition Fun!</h1>
        
        <div className="flex justify-center space-x-4 mb-8">
          <button
            className={`btn ${gameState.isVisualMode ? 'btn-primary' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setGameState(prev => ({ ...prev, isVisualMode: true }))}
          >
            Visual Mode
          </button>
          <button
            className={`btn ${!gameState.isVisualMode ? 'btn-primary' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setGameState(prev => ({ ...prev, isVisualMode: false }))}
          >
            Number Mode
          </button>
        </div>

        <div className="flex justify-center items-center space-x-4 mb-8">
          {gameState.isVisualMode ? (
            <>
              <div className="flex flex-wrap justify-center max-w-[120px]">
                {Array(gameState.num1).fill(0).map((_, i) => (
                  <Circle key={`left-${i}`} color="bg-secondary" />
                ))}
              </div>
              <span className="text-3xl">+</span>
              <div className="flex flex-wrap justify-center max-w-[120px]">
                {Array(gameState.num2).fill(0).map((_, i) => (
                  <Circle key={`right-${i}`} color="bg-primary" />
                ))}
              </div>
            </>
          ) : (
            <div className="text-4xl font-bold">
              {gameState.num1} + {gameState.num2}
            </div>
          )}
          <span className="text-3xl">=</span>
          <span className="text-3xl">?</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {gameState.options.map((option, index) => (
            <motion.button
              key={index}
              className="option-button bg-white border-2 border-primary text-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(option)}
            >
              {option}
            </motion.button>
          ))}
        </div>

        <div className="flex justify-between items-center mt-8 text-xl">
          <div>Score: {gameState.score}</div>
          <div>Streak: {gameState.streak}/5</div>
          <div>Level: {gameState.level}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
