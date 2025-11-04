'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, ExternalLink, Gamepad2, CheckCircle2 } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import progressAPI from '@/lib/api/progress.api'
import CourseHeader from '@/components/courses/CourseHeader'
import ProgressBar from '@/components/courses/ProgressBar'
import { ROLE_COLORS } from '@/lib/theme'

interface Course {
  id: number
  title: string
  description: string
  total_levels: number
  total_steps?: number
  url?: string
}

interface GameVisionProps {
  course: Course
}

// Default game URL (fallback if not provided in course data)
const DEFAULT_GAME_URL = 'https://www.roblox.com/games/135558747171052/EcoBlox-Team-1'

const quizQuestions = [
  {
    id: 1,
    question: 'What powers the K-Pop concert?',
    options: [
      { id: 'a', text: 'Solar panels' },
      { id: 'b', text: 'Recycled EV batteries' },
      { id: 'c', text: 'Coal power' },
      { id: 'd', text: 'Wind turbines' }
    ],
    correctAnswer: 'b'
  },
  {
    id: 2,
    question: 'What happens if energy runs out?',
    options: [
      { id: 'a', text: 'Concert continues' },
      { id: 'b', text: 'Blackout - game over' },
      { id: 'c', text: 'Nothing' },
      { id: 'd', text: 'You get bonus points' }
    ],
    correctAnswer: 'b'
  },
  {
    id: 3,
    question: 'How much energy is needed total?',
    options: [
      { id: 'a', text: '100 kWh' },
      { id: 'b', text: '200 kWh' },
      { id: 'c', text: '500 kWh' },
      { id: 'd', text: '50 kWh' }
    ],
    correctAnswer: 'b'
  }
]

export default function GameVision({ course }: GameVisionProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(0) // 0=game, 1=q1, 2=q2, 3=q3
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (user) {
      loadProgress()
    }
  }, [user])

  const loadProgress = async () => {
    try {
      if (!user) return

      const response = await progressAPI.getStudentCourseProgress(user.id, course.id)
      const events = response.progress_events || []

      // Load completed steps
      const completed = new Set<number>()
      const answers: Record<number, string> = {}

      events.forEach((e: any) => {
        if (e.event_type === 'step_checked' &&
            e.level === 1 &&
            e.data?.step !== undefined &&
            e.is_checked !== false) {
          completed.add(e.data.step)

          // If it's a question step, load the answer
          if (e.data.answer) {
            const questionId = e.data.step // step 1 = question 1, etc.
            answers[questionId] = e.data.answer
          }
        }
      })

      setCompletedSteps(completed)
      setSelectedAnswers(answers)

      // Determine current step based on completed steps
      if (completed.has(3)) {
        setCurrentStep(3) // All done
      } else if (completed.has(2)) {
        setCurrentStep(3) // On question 3
      } else if (completed.has(1)) {
        setCurrentStep(2) // On question 2
      } else if (completed.has(0)) {
        setCurrentStep(1) // On question 1
      } else {
        setCurrentStep(0) // On game play step
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  const handleGamePlayed = async () => {
    if (user) {
      try {
        await progressAPI.createProgress({
          student_id: user.id,
          course_id: course.id,
          event_type: 'step_checked',
          level: 1,
          data: { step: 0 }
        })

        setCompletedSteps(prev => new Set(prev).add(0))
        setCurrentStep(1) // Move to question 1
      } catch (error) {
        console.error('Failed to track game play:', error)
      }
    }
  }

  const handleAnswerSelect = async (questionId: number, answerId: string) => {
    // Don't allow changing answers once selected
    if (selectedAnswers[questionId]) {
      return
    }

    // Update selected answers
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }))

    // Check if correct
    const question = quizQuestions.find(q => q.id === questionId)
    const isCorrect = question && answerId === question.correctAnswer

    // Save progress to backend
    if (user && isCorrect) {
      try {
        // Track this step as completed
        await progressAPI.createProgress({
          student_id: user.id,
          course_id: course.id,
          event_type: 'step_checked',
          level: 1,
          data: {
            step: questionId, // step 1, 2, or 3
            answer: answerId,
            question: question.question
          }
        })

        setCompletedSteps(prev => new Set(prev).add(questionId))

        // If this was question 3 (last question), complete the quest
        if (questionId === 3) {
          await progressAPI.createProgress({
            student_id: user.id,
            course_id: course.id,
            event_type: 'quest_completed',
            level: 1,
            data: { quest_name: 'Game Vision & Concept' }
          })

          setShowCelebration(true)
        }
      } catch (error) {
        console.error('Failed to track answer:', error)
      }
    }
  }

  const handleNextQuestion = () => {
    setCurrentStep(prev => prev + 1)
  }

  const handleTryAgain = (questionId: number) => {
    // Clear the selected answer for this question so they can try again
    setSelectedAnswers(prev => {
      const newAnswers = { ...prev }
      delete newAnswers[questionId]
      return newAnswers
    })
  }

  const calculateScore = () => {
    let correct = 0
    quizQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++
      }
    })
    return correct
  }

  // Use course URL or fall back to default
  const gameUrl = course.url || DEFAULT_GAME_URL
  // Calculate total steps for this course (default to 4 if not provided)
  const totalSteps = course.total_steps || 4

  // Get current question based on step
  const currentQuestion = currentStep > 0 && currentStep <= 3 ? quizQuestions[currentStep - 1] : null
  const questionAnswered = currentQuestion && selectedAnswers[currentQuestion.id] !== undefined
  const questionCorrect = currentQuestion && selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer

  return (
    <div className="min-h-screen bg-gray-50">
      <CourseHeader
        title={course.title}
        subtitle={course.description}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Level 1: Game Vision & Concept</span>
            <span className="text-sm text-gray-500">Step {currentStep + 1} of {totalSteps}</span>
          </div>
          <ProgressBar current={currentStep + 1} total={totalSteps} />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${ROLE_COLORS.student.primary}15` }}>
              <Gamepad2 size={24} style={{ color: ROLE_COLORS.student.primary }} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Game Vision & Concept</h1>
          </div>

          {/* Game Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What is this game?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In this game, you'll build a K-Pop concert powered by recycled batteries. Players collect
              used EV batteries, convert them into energy blocks, and keep the concert running. If you
              run out of energy - blackout!
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-1">Your Goal:</p>
              <p className="text-sm text-blue-800">
                Power a 2-hour K-Pop concert that needs 200 kWh of energy.
              </p>
            </div>
          </div>

          {/* Step 0: Play the Game Section */}
          {currentStep === 0 && (
            <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Watch & Play</h2>
              <p className="text-gray-700 mb-4">
                Spend 5-10 minutes exploring the game to understand what you'll be building!
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <a
                  href={gameUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-6 py-3 rounded-lg text-white font-medium transition hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: ROLE_COLORS.student.primary }}
                  onClick={handleGamePlayed}
                >
                  <ExternalLink size={20} />
                  Play the Game
                </a>

                <button
                  onClick={handleGamePlayed}
                  className="px-6 py-3 rounded-lg border-2 text-gray-700 font-medium hover:bg-gray-50 transition"
                  style={{ borderColor: ROLE_COLORS.student.primary }}
                >
                  Mark as Played
                </button>
              </div>
            </div>
          )}

          {/* Steps 1-3: Quiz Questions */}
          {currentStep >= 1 && currentStep <= 3 && currentQuestion && (
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg p-6 text-white">
              <h4 className="text-2xl font-bold mb-4">🎯 Level 1 Challenge</h4>
              <p className="text-lg mb-6">Question {currentStep} of 3</p>

              <div className="mb-6">
                <p className="text-xl font-semibold mb-4">
                  {currentQuestion.question}
                </p>

                <div className="space-y-3">
                  {currentQuestion.options.map(option => {
                    const isSelected = selectedAnswers[currentQuestion.id] === option.id
                    const isCorrect = option.id === currentQuestion.correctAnswer
                    const showCorrectAnswer = questionAnswered && isCorrect
                    const showWrongAnswer = questionAnswered && isSelected && !isCorrect

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                        disabled={questionAnswered || false}
                        className={`w-full p-4 rounded-lg text-left font-medium transition ${
                          showCorrectAnswer
                            ? 'bg-green-500 text-white'
                            : showWrongAnswer
                            ? 'bg-red-500 text-white'
                            : isSelected
                            ? 'bg-white/30 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        } ${questionAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {option.text}
                        {showCorrectAnswer && ' ✓'}
                        {showWrongAnswer && ' ✗'}
                      </button>
                    )
                  })}
                </div>

                {/* Show immediate feedback */}
                {questionAnswered && (
                  <div className="mt-4">
                    {questionCorrect ? (
                      <div>
                        <p className="text-green-200 font-bold text-lg mb-4">
                          ✓ Correct! Great job!
                        </p>
                        {currentStep < 3 && (
                          <button
                            onClick={handleNextQuestion}
                            className="px-6 py-3 bg-white rounded-lg font-bold transition hover:bg-gray-100"
                            style={{ color: ROLE_COLORS.student.primary }}
                          >
                            Next Question →
                          </button>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-red-200 font-bold text-lg mb-2">
                          ✗ Incorrect. The correct answer is highlighted above.
                        </p>
                        <p className="text-white/90 mb-4">
                          Review the correct answer and try again!
                        </p>
                        <button
                          onClick={() => handleTryAgain(currentQuestion.id)}
                          className="px-6 py-3 bg-white rounded-lg font-bold transition hover:bg-gray-100"
                          style={{ color: ROLE_COLORS.student.primary }}
                        >
                          Try Again
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/student/dashboard')}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Back to Dashboard
          </button>

          {completedSteps.has(3) && (
            <button
              onClick={() => router.push('/student/dashboard')}
              className="px-6 py-2 rounded-lg text-white font-medium transition"
              style={{ backgroundColor: ROLE_COLORS.student.primary }}
            >
              Complete Course
            </button>
          )}
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4"
                   style={{ backgroundColor: `${ROLE_COLORS.student.primary}15` }}>
                <Trophy size={40} style={{ color: ROLE_COLORS.student.primary }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Level 1 Complete!</h2>
              <p className="text-gray-600">
                You've completed "Game Vision & Concept"
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">XP Earned</p>
              <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>
                +200 XP
              </p>
            </div>

            <button
              onClick={() => router.push('/student/dashboard')}
              className="w-full px-6 py-3 rounded-lg text-white font-medium transition"
              style={{ backgroundColor: ROLE_COLORS.student.primary }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
