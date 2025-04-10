'use client';

import { useState, useEffect } from 'react';
import React from 'react';

type GameMode = 'visual' | 'numbers';

export default function AdditionGame() {
  const [num1, setNum1] = useState<number>(1);
  const [num2, setNum2] = useState<number>(1);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<number>(1);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>('visual');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [ankiConnected, setAnkiConnected] = useState<boolean>(false);
  const [saveToAnki, setSaveToAnki] = useState<boolean>(false);
  const [choices, setChoices] = useState<number[]>([]);
  
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
  
  // Function to check Anki connection
  const checkAnkiConnection = async () => {
    console.log('Attempting to connect to Anki...');
    try {
      const response = await fetch('http://localhost:8765', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'requestPermission',
          version: 6,
        }),
      });
      
      console.log('Anki response:', response);
      const data = await response.json();
      console.log('Anki data:', data);

      if (data.result && data.result.permission === 'granted') {
        console.log('Successfully connected to Anki!');
        setAnkiConnected(true);
        return true;
      } else {
        console.log('Failed to get permission from Anki');
        setAnkiConnected(false);
        return false;
      }
    } catch (error) {
      console.error('Error connecting to Anki:', error);
      setAnkiConnected(false);
      return false;
    }
  };
  
  // Function to save a card to Anki
  const saveCardToAnki = async (front: string, back: string): Promise<void> => {
    console.log('Attempting to save card to Anki...', { front, back });
    if (!ankiConnected) {
      console.log('Not connected to Anki, attempting to connect...');
      const connected = await checkAnkiConnection();
      if (!connected) {
        console.log('Failed to connect to Anki, cannot save card');
        return;
      }
    }
    
    try {
      // First, create the deck if it doesn't exist
      console.log('Creating deck "Addition" if it doesn\'t exist...');
      const createDeckResponse = await fetch('http://localhost:8765', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createDeck',
          version: 6,
          params: {
            deck: 'Addition'
          }
        }),
      });
      
      const createDeckData = await createDeckResponse.json();
      console.log('Create deck response:', createDeckData);

      // Then add the note to the deck
      console.log('Adding note to deck...');
      const response = await fetch('http://localhost:8765', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addNote',
          version: 6,
          params: {
            note: {
              deckName: 'Addition',
              modelName: 'Basic',
              fields: {
                Front: front,
                Back: back
              },
              tags: ['addition-game', `level-${difficulty}`]
            }
          }
        }),
      });
      
      const data = await response.json();
      console.log('Add note response:', data);

      if (data && data.error) {
        console.error('Anki error:', data.error);
        setFeedback('Failed to save to Anki');
      } else {
        console.log('Successfully saved card to Anki!');
        setFeedback('Saved to Anki! 🎉');
      }
    } catch (error) {
      console.error('Error saving to Anki:', error);
      setFeedback('Failed to save to Anki');
    }
  };
  
  // Check Anki connection on component mount
  useEffect(() => {
    checkAnkiConnection();
  }, []);
  
  // Generate answer choices
  const generateChoices = (answer: number): number[] => {
    const options = [answer];
    
    // Generate 3 unique incorrect options that are close to the correct answer
    while (options.length < 4) {
      // Create plausible wrong answers (within ±3 of correct answer, but not negative)
      let wrongAnswer = answer + Math.floor(Math.random() * 5) - 2;
      
      // Make sure wrong answer is positive and not the same as the correct answer
      if (wrongAnswer > 0 && wrongAnswer !== answer && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    // Shuffle the options
    return options.sort(() => Math.random() - 0.5);
  };
  
  // Update choices when generating a new problem
  useEffect(() => {
    if (num1 !== null && num2 !== null) {
      setChoices(generateChoices(num1 + num2));
    }
  }, [num1, num2]);
  
  // Handle answer submission
  const checkAnswer = (selectedAnswer: number): void => {
    const correctAnswer = num1 + num2;
    
    if (selectedAnswer === correctAnswer) {
      setFeedback('Great job! That\'s correct! 🎉');
      setScore(score + 1);
      setStreak(streak + 1);
      setShowConfetti(true);
      
      // Save to Anki if enabled
      if (saveToAnki) {
        const front = `${num1} + ${num2} = ?`;
        const back = `${correctAnswer}`;
        saveCardToAnki(front, back);
      }
      
      // After 1.5 seconds, hide confetti and generate new problem
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
  const renderCircles = (number: number, color: string): JSX.Element[] => {
    const circles = [];
    for (let i = 0; i < number; i++) {
      // Add margin right for grouping (after each 5th element except the last one)
      const isGroupBreak = (i + 1) % 5 === 0 && i !== number - 1;
      circles.push(
        <div 
          key={i} 
          className={`w-8 h-8 rounded-full ${color} mx-1 ${isGroupBreak ? 'mr-4' : ''} inline-block`}
        />
      );
    }
    return circles;
  };
  
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="p-6 max-w-lg mx-auto bg-blue-50 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Addition Fun!</h1>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
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
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">
              <input
                type="checkbox"
                checked={saveToAnki}
                onChange={(e) => setSaveToAnki(e.target.checked)}
                className="mr-2"
              />
              Save to Anki
            </label>
            <div className={`w-2 h-2 rounded-full ${ankiConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-inner mb-6">
          {/* Visual representation */}
          {gameMode === 'visual' && (
            <div className="flex flex-col justify-center items-center mb-4">
              <div className="flex justify-center items-center mb-2">
                <div className="flex flex-wrap justify-center items-center">
                  {renderCircles(num1, 'bg-red-400')}
                </div>
              </div>
              <div className="flex items-center mb-2">
                <div className="text-2xl mr-2">+</div>
              </div>
              <div className="flex justify-center items-center mb-2">
                <div className="flex flex-wrap justify-center items-center">
                  {renderCircles(num2, 'bg-blue-400')}
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-2xl mr-2">=</div>
                <div className="text-2xl">?</div>
              </div>
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
          
          {/* Multiple choice answers */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => checkAnswer(choice)}
                className="bg-white border-2 border-blue-300 hover:border-blue-500 rounded-xl p-4 text-3xl font-bold text-center shadow hover:shadow-md transition transform hover:scale-105"
              >
                {choice}
              </button>
            ))}
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
    </main>
  );
}