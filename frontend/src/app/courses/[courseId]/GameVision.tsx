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
}

interface GameVisionProps {
  course: Course
}

const GAME_URL = 'https://www.roblox.com/games/135558747171052/EcoBlox-Team-1'

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
  const [hasPlayedGame, setHasPlayedGame] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
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

      // Check if game has been played
      const gamePlayedEvent = events.find((e: any) =>
        e.event_type === 'step_checked' && e.level === 1
      )
      if (gamePlayedEvent) {
        setHasPlayedGame(true)
      }

      // Load quiz answers
      const quizEvent = events.find((e: any) =>
        e.event_type === 'quiz_answered' && e.level === 1
      )
      if (quizEvent) {
        const data = typeof quizEvent.data === 'string' ? JSON.parse(quizEvent.data) : quizEvent.data
        setSelectedAnswers(data.answers || {})
        setShowResults(true)
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  const handleGamePlayed = async () => {
    setHasPlayedGame(true)

    if (user) {
      try {
        await progressAPI.createProgress({
          student_id: user.id,
          course_id: course.id,
          event_type: 'step_checked',
          level: 1,
          data: { step: 'game_played' }
        })
      } catch (error) {
        console.error('Failed to track game play:', error)
      }
    }
  }

  const handleAnswerSelect = (questionId: number, answerId: string) => {
    if (!showResults) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: answerId
      }))
    }
  }

  const handleSubmitQuiz = async () => {
    // Check if all questions are answered
    if (Object.keys(selectedAnswers).length !== quizQuestions.length) {
      alert('Please answer all questions before submitting!')
      return
    }

    setShowResults(true)

    // Calculate score
    let correct = 0
    quizQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++
      }
    })

    const passed = correct === quizQuestions.length

    if (user) {
      try {
        // Track quiz completion
        await progressAPI.createProgress({
          student_id: user.id,
          course_id: course.id,
          event_type: 'quiz_answered',
          level: 1,
          data: {
            answers: selectedAnswers,
            score: correct,
            total: quizQuestions.length,
            passed
          }
        })

        if (passed) {
          // Track quest completion
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
        console.error('Failed to track quiz:', error)
      }
    }
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

  const allAnswered = Object.keys(selectedAnswers).length === quizQuestions.length
  const score = showResults ? calculateScore() : 0
  const passed = score === quizQuestions.length

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
            <span className="text-sm text-gray-500">Step 1 of 6</span>
          </div>
          <ProgressBar current={1} total={6} />
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

          {/* Play the Game Section */}
          <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Watch & Play</h2>
            <p className="text-gray-700 mb-4">
              Spend 5-10 minutes exploring the game to understand what you'll be building!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <a
                href={GAME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-3 rounded-lg text-white font-medium transition hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: ROLE_COLORS.student.primary }}
                onClick={handleGamePlayed}
              >
                <ExternalLink size={20} />
                Play the Game
              </a>

              {!hasPlayedGame && (
                <button
                  onClick={handleGamePlayed}
                  className="px-6 py-3 rounded-lg border-2 text-gray-700 font-medium hover:bg-gray-50 transition"
                  style={{ borderColor: ROLE_COLORS.student.primary }}
                >
                  Mark as Played
                </button>
              )}
            </div>

            {hasPlayedGame && (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 size={20} />
                <span className="text-sm font-medium">Game played! ✓</span>
              </div>
            )}
          </div>

          {/* Quiz Section */}
          {hasPlayedGame && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Check Your Understanding</h2>

              {quizQuestions.map((question, index) => (
                <div key={question.id} className="mb-6 last:mb-0">
                  <p className="font-medium text-gray-900 mb-3">
                    {index + 1}. {question.question}
                  </p>

                  <div className="space-y-2">
                    {question.options.map(option => {
                      const isSelected = selectedAnswers[question.id] === option.id
                      const isCorrect = option.id === question.correctAnswer
                      const showCorrectAnswer = showResults && isCorrect
                      const showWrongAnswer = showResults && isSelected && !isCorrect

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleAnswerSelect(question.id, option.id)}
                          disabled={showResults}
                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                            showCorrectAnswer
                              ? 'border-green-500 bg-green-50'
                              : showWrongAnswer
                              ? 'border-red-500 bg-red-50'
                              : isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${showResults ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">{option.id})</span>
                            <span className={
                              showCorrectAnswer ? 'text-green-900 font-medium' :
                              showWrongAnswer ? 'text-red-900' :
                              isSelected ? 'text-blue-900' :
                              'text-gray-700'
                            }>
                              {option.text}
                            </span>
                            {showCorrectAnswer && <span className="ml-auto">✓</span>}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {!showResults && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered}
                  className="w-full mt-6 px-6 py-3 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: ROLE_COLORS.student.primary }}
                >
                  Submit Quiz
                </button>
              )}

              {showResults && (
                <div className={`mt-6 p-4 rounded-lg border-2 ${
                  passed ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'
                }`}>
                  <p className={`font-semibold mb-2 ${passed ? 'text-green-900' : 'text-yellow-900'}`}>
                    Score: {score} / {quizQuestions.length}
                  </p>
                  <p className={passed ? 'text-green-800' : 'text-yellow-800'}>
                    {passed
                      ? '🎉 Perfect! You understand the game concept. Ready for the next level!'
                      : 'Review the game description and try to understand the key concepts better.'
                    }
                  </p>
                </div>
              )}
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

          {passed && (
            <button
              onClick={() => router.push('/student/dashboard')}
              className="px-6 py-2 rounded-lg text-white font-medium transition"
              style={{ backgroundColor: ROLE_COLORS.student.primary }}
            >
              Continue to Next Level
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
