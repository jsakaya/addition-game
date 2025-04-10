import { useState, useCallback, useEffect } from 'react'
import confetti from 'canvas-confetti'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [gameMode, setGameMode] = useState('visual')
  const [num1, setNum1] = useState(1)
  const [num2, setNum2] = useState(1)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [level, setLevel] = useState(1)
  const [options, setOptions] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)

  const generateProblem = useCallback(() => {
    let max = level === 1 ? 5 : level === 2 ? 10 : 20
    let n1 = Math.floor(Math.random() * max) + 1
    let n2 = Math.floor(Math.random() * max) + 1
    
    // Ensure sum is appropriate for current level
    while (n1 + n2 > max * 1.5) {
      n1 = Math.floor(Math.random() * max) + 1
      n2 = Math.floor(Math.random() * max) + 1
    }
    
    setNum1(n1)
    setNum2(n2)
    
    // Generate answer options
    const correctAnswer = n1 + n2
    let wrongAnswer
    do {
      wrongAnswer = Math.floor(Math.random() * (max * 1.5)) + 1
    } while (wrongAnswer === correctAnswer)
    
    const answers = [correctAnswer, wrongAnswer]
    setOptions(answers.sort(() => Math.random() - 0.5))
    
    setSelectedAnswer(null)
    setFeedback('')
    setIsCorrect(null)
  }, [level])

  useEffect(() => {
    generateProblem()
  }, [generateProblem, gameMode])

  const handleAnswer = (answer) => {
    const correctAnswer = num1 + num2
    const isAnswerCorrect = answer === correctAnswer
    
    setSelectedAnswer(answer)
    setIsCorrect(isAnswerCorrect)
    
    if (isAnswerCorrect) {
      setFeedback('Amazing! 🎉')
      setScore(score + 1)
      setStreak(streak + 1)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      
      // Level up logic
      if (streak === 4) {
        if (level < 3) {
          setLevel(level + 1)
          setStreak(0)
          setFeedback('Level Up! 🌟')
        }
      }
      
      setTimeout(() => {
        generateProblem()
      }, 1500)
    } else {
      setFeedback('Try again! 💪')
      setStreak(0)
    }
  }

  const Circle = ({ color }) => (
    <div className={`w-8 h-8 rounded-full ${color} shadow-md`} />
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-white py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">
          Math Adventure!
        </h1>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setGameMode('visual')}
            className={`px-4 py-2 rounded-full transition-all ${
              gameMode === 'visual'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Visual Mode
          </button>
          <button
            onClick={() => setGameMode('numbers')}
            className={`px-4 py-2 rounded-full transition-all ${
              gameMode === 'numbers'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Number Mode
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
          {gameMode === 'visual' ? (
            <div className="flex justify-center items-center space-x-4">
              <div className="flex flex-wrap gap-2 justify-center max-w-[120px]">
                {[...Array(num1)].map((_, i) => (
                  <Circle key={`left-${i}`} color="bg-red-400" />
                ))}
              </div>
              <span className="text-3xl text-gray-600">+</span>
              <div className="flex flex-wrap gap-2 justify-center max-w-[120px]">
                {[...Array(num2)].map((_, i) => (
                  <Circle key={`right-${i}`} color="bg-blue-400" />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center space-x-4">
              <span className="text-5xl font-bold text-red-400">{num1}</span>
              <span className="text-4xl text-gray-600">+</span>
              <span className="text-5xl font-bold text-blue-400">{num2}</span>
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              className={`
                px-8 py-4 text-2xl font-bold rounded-xl transition-all transform hover:scale-105
                ${
                  selectedAnswer === null
                    ? 'bg-secondary text-white shadow-md hover:bg-secondary-dark'
                    : selectedAnswer === option
                    ? isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }
              `}
            >
              {option}
            </button>
          ))}
        </div>

        {feedback && (
          <div className="text-center">
            <p
              className={`text-xl font-bold ${
                isCorrect ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {feedback}
            </p>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <div>Score: <span className="font-bold text-primary">{score}</span></div>
          <div>Streak: <span className="font-bold text-secondary">{streak}/5</span></div>
          <div>Level: <span className="font-bold text-accent">{level}</span></div>
        </div>
      </div>
    </div>
  )
}

export default App
