'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import progressAPI from '@/lib/api/progress.api'
import CourseHeader from '@/components/courses/CourseHeader'
import StepCheckbox from '@/components/courses/StepCheckbox'
import { ROLE_COLORS } from '@/lib/theme'
import Image from 'next/image'

interface Course {
  id: number
  title: string
  description: string
  total_levels: number
}

interface StudioBasicsProps {
  course: Course
}

interface LevelData {
  levelNumber: number
  title: string
  imageName: string
  steps: { title: string; description: string }[]
  quiz: {
    question: string
    options: string[]
    correctIndex: number
  }
}

const XP_PER_STEP = 30
const XP_PER_QUIZ = 50
const STEPS_PER_LEVEL = 4

export default function StudioBasics({ course }: StudioBasicsProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [currentLevel, setCurrentLevel] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<Record<number, Set<number>>>({})
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({})
  const [showQuizResult, setShowQuizResult] = useState<Record<number, boolean>>({})
  const [totalXP, setTotalXP] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([1]))

  const levels: LevelData[] = [
    {
      levelNumber: 1,
      title: 'Mezzanine',
      imageName: 'Mezzanine.jpg',
      steps: [
        { title: 'Open the Home tab', description: 'Located at the top-left corner of the Studio interface' },
        { title: 'Find the Mezzanine section', description: 'Look for the central area with various tools and options' },
        { title: 'Identify key features', description: 'Note the Play, Stop, and other control buttons' },
        { title: 'Explore the interface', description: 'Get familiar with the layout and organization' }
      ],
      quiz: {
        question: 'What is the Mezzanine in Roblox Studio?',
        options: [
          'A floor between two main floors',
          'The central toolbar area with control buttons',
          'A type of building block',
          'The 3D viewport window'
        ],
        correctIndex: 1
      }
    },
    {
      levelNumber: 2,
      title: 'Toolbar',
      imageName: 'Toolbar.jpg',
      steps: [
        { title: 'Locate the Toolbar', description: 'Find the toolbar at the top of the Studio window' },
        { title: 'Explore tool categories', description: 'Notice the different tabs: Home, Model, Test, View' },
        { title: 'Identify common tools', description: 'Find Select, Move, Scale, and Rotate tools' },
        { title: 'Practice switching tabs', description: 'Click through each tab to see available options' }
      ],
      quiz: {
        question: 'Which tab contains the Select, Move, and Rotate tools?',
        options: ['Test tab', 'Home tab', 'View tab', 'Model tab'],
        correctIndex: 1
      }
    },
    {
      levelNumber: 3,
      title: '3D Viewport',
      imageName: '3D-Viewport.jpg',
      steps: [
        { title: 'Find the 3D Viewport', description: 'The large central area showing your game world' },
        { title: 'Practice camera controls', description: 'Right-click and drag to rotate the camera' },
        { title: 'Learn to zoom', description: 'Use the scroll wheel to zoom in and out' },
        { title: 'Navigate the scene', description: 'Use WASD keys to move around the viewport' }
      ],
      quiz: {
        question: 'How do you rotate the camera in the 3D Viewport?',
        options: [
          'Left-click and drag',
          'Right-click and drag',
          'Middle-click and drag',
          'Use arrow keys'
        ],
        correctIndex: 1
      }
    },
    {
      levelNumber: 4,
      title: 'Toolbox',
      imageName: 'Toolbox.jpg',
      steps: [
        { title: 'Open the Toolbox', description: 'Click View tab → Toolbox, or press Ctrl+T' },
        { title: 'Browse categories', description: 'Explore Models, Images, Meshes, Audio, and more' },
        { title: 'Search for assets', description: 'Use the search bar to find specific items' },
        { title: 'Insert an asset', description: 'Click on any asset to add it to your game' }
      ],
      quiz: {
        question: 'What can you find in the Toolbox?',
        options: [
          'Only code scripts',
          'Game settings only',
          'Models, images, audio, and other assets',
          'Player statistics'
        ],
        correctIndex: 2
      }
    },
    {
      levelNumber: 5,
      title: 'Explorer',
      imageName: 'Explorer.jpg',
      steps: [
        { title: 'Locate the Explorer window', description: 'Usually on the right side of the Studio interface' },
        { title: 'Understand the hierarchy', description: 'See how objects are organized in a tree structure' },
        { title: 'Expand and collapse folders', description: 'Click the arrow icons to show/hide contents' },
        { title: 'Select objects', description: 'Click on any object to select it in the viewport' }
      ],
      quiz: {
        question: 'What does the Explorer window show?',
        options: [
          'The game\'s terrain only',
          'A hierarchical tree of all objects in your game',
          'Only scripts and code',
          'Player inventory items'
        ],
        correctIndex: 1
      }
    },
    {
      levelNumber: 6,
      title: 'Properties',
      imageName: 'Properties.jpg',
      steps: [
        { title: 'Find the Properties window', description: 'Typically located below the Explorer window' },
        { title: 'Select an object', description: 'Click any object in Explorer or Viewport' },
        { title: 'View object properties', description: 'See all attributes like Name, Position, Color, etc.' },
        { title: 'Modify a property', description: 'Try changing the Color or Size of an object' }
      ],
      quiz: {
        question: 'What can you do in the Properties window?',
        options: [
          'Only change object names',
          'View and modify attributes of selected objects',
          'Run game scripts',
          'Add new objects to the game'
        ],
        correctIndex: 1
      }
    }
  ]

  useEffect(() => {
    if (user) {
      loadProgress()
    }
  }, [user])

  useEffect(() => {
    calculateXP()
  }, [completedSteps, quizAnswers])

  const loadProgress = async () => {
    try {
      if (!user) return

      // Load progress from backend
      const response = await progressAPI.getStudentCourseProgress(user.id, course.id)
      const events = response.progress_events

      // Process step completion events
      const stepsMap: Record<number, Set<number>> = {}
      const quizAnswersMap: Record<number, number> = {}
      const quizResultsMap: Record<number, boolean> = {}

      // Process events - since they're ordered DESC (newest first),
      // we want the FIRST occurrence of each quiz answer (most recent)
      const seenQuizLevels = new Set<number>()

      events.forEach((event: any) => {
        if (event.event_type === 'step_checked') {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
          const level = event.level
          const stepIndex = data.step

          if (!stepsMap[level]) {
            stepsMap[level] = new Set()
          }
          stepsMap[level].add(stepIndex)
        } else if (event.event_type === 'quiz_answered') {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
          const level = event.level

          // Only store the first (most recent) quiz answer for each level
          if (!seenQuizLevels.has(level)) {
            quizAnswersMap[level] = data.answer_index
            quizResultsMap[level] = true // Show result since quiz was answered
            seenQuizLevels.add(level)
          }
        }
      })

      setCompletedSteps(stepsMap)
      setQuizAnswers(quizAnswersMap)
      setShowQuizResult(quizResultsMap)
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  const calculateXP = () => {
    let xp = 0

    // XP from completed steps
    for (const steps of Object.values(completedSteps)) {
      xp += steps.size * XP_PER_STEP
    }

    // XP from correct quiz answers
    for (const [level, answerIndex] of Object.entries(quizAnswers)) {
      if (answerIndex !== null) {
        const levelNum = parseInt(level)
        const levelData = levels[levelNum - 1]
        if (levelData && answerIndex === levelData.quiz.correctIndex) {
          xp += XP_PER_QUIZ
        }
      }
    }

    setTotalXP(xp)
  }

  const handleStepToggle = async (levelNumber: number, stepIndex: number) => {
    const levelSteps = completedSteps[levelNumber] || new Set<number>()
    const newSteps = new Set(levelSteps)

    if (newSteps.has(stepIndex)) {
      newSteps.delete(stepIndex)
    } else {
      newSteps.add(stepIndex)

      // Track progress
      if (user) {
        try {
          await progressAPI.createProgress({
            student_id: user.id,
            course_id: course.id,
            event_type: 'step_checked',
            level: levelNumber,
            data: { step: stepIndex }
          })
        } catch (error) {
          console.error('Failed to track progress:', error)
        }
      }
    }

    const newCompletedSteps = { ...completedSteps, [levelNumber]: newSteps }
    setCompletedSteps(newCompletedSteps)

    // Unlock next level if all steps completed
    if (newSteps.size === STEPS_PER_LEVEL) {
      if (user) {
        try {
          await progressAPI.createProgress({
            student_id: user.id,
            course_id: course.id,
            event_type: 'level_unlocked',
            level: levelNumber + 1,
            data: { from_level: levelNumber }
          })
        } catch (error) {
          console.error('Failed to track level unlock:', error)
        }
      }
    }
  }

  const handleQuizAnswer = async (levelNumber: number, answerIndex: number) => {
    const newAnswers = { ...quizAnswers, [levelNumber]: answerIndex }
    setQuizAnswers(newAnswers)
    setShowQuizResult({ ...showQuizResult, [levelNumber]: true })

    // Track progress
    if (user) {
      const levelData = levels[levelNumber - 1]
      const isCorrect = answerIndex === levelData.quiz.correctIndex

      try {
        await progressAPI.createProgress({
          student_id: user.id,
          course_id: course.id,
          event_type: 'quiz_answered',
          level: levelNumber,
          data: {
            question: levelData.quiz.question,
            answer_index: answerIndex,
            correct: isCorrect
          }
        })

        // Check if all quizzes completed correctly
        if (levelNumber === levels.length && isCorrect) {
          const allCorrect = levels.every((level, idx) => {
            const answer = newAnswers[idx + 1]
            return answer === level.quiz.correctIndex
          })

          if (allCorrect) {
            setShowCelebration(true)
            await progressAPI.createProgress({
              student_id: user.id,
              course_id: course.id,
              event_type: 'quest_completed',
              level: levelNumber,
              data: { all_quizzes_correct: true }
            })
          }
        }
      } catch (error) {
        console.error('Failed to track quiz:', error)
      }
    }
  }

  const handleRetakeQuiz = (levelNumber: number) => {
    // Clear the quiz answer and result for this level
    const newAnswers = { ...quizAnswers }
    delete newAnswers[levelNumber]
    setQuizAnswers(newAnswers)

    const newResults = { ...showQuizResult }
    delete newResults[levelNumber]
    setShowQuizResult(newResults)
  }

  const toggleLevel = (levelNumber: number) => {
    const newExpanded = new Set(expandedLevels)
    if (newExpanded.has(levelNumber)) {
      newExpanded.delete(levelNumber)
    } else {
      newExpanded.add(levelNumber)
    }
    setExpandedLevels(newExpanded)
  }

  const totalXPPossible = levels.length * (STEPS_PER_LEVEL * XP_PER_STEP + XP_PER_QUIZ)

  return (
    <div className="min-h-screen bg-gray-50">
      <CourseHeader
        title={course.title}
        subtitle={course.description}
        currentXP={totalXP}
        totalXP={totalXPPossible}
        currentLevel={currentLevel}
        totalLevels={course.total_levels}
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Levels */}
        <div className="space-y-6">
          {levels.map((level) => {
            const isExpanded = expandedLevels.has(level.levelNumber)
            const levelSteps = completedSteps[level.levelNumber] || new Set<number>()
            const allStepsComplete = levelSteps.size === STEPS_PER_LEVEL
            const quizAnswered = quizAnswers[level.levelNumber] !== undefined && quizAnswers[level.levelNumber] !== null
            const quizCorrect = quizAnswered && quizAnswers[level.levelNumber] === level.quiz.correctIndex
            const levelComplete = allStepsComplete && quizCorrect

            return (
              <div
                key={level.levelNumber}
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  levelComplete ? 'border-2 border-green-500' : ''
                }`}
              >
                {/* Level Header */}
                <button
                  onClick={() => toggleLevel(level.levelNumber)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                        levelComplete
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {levelComplete ? '✓' : level.levelNumber}
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900">
                        Level {level.levelNumber}: {level.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {levelSteps.size}/{STEPS_PER_LEVEL} steps • {quizCorrect ? 'Quiz passed' : quizAnswered ? 'Try quiz again' : 'Quiz pending'}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </button>

                {/* Level Content */}
                {isExpanded && (
                  <div className="px-6 pb-6">
                    {/* Image */}
                    <div className="mb-6 rounded-lg overflow-hidden">
                      <Image
                        src={`/images/courses/${level.imageName}`}
                        alt={level.title}
                        width={800}
                        height={450}
                        className="w-full h-auto"
                      />
                    </div>

                    {/* Steps */}
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Complete These Steps:</h4>
                      <ul className="space-y-3">
                        {level.steps.map((step, idx) => (
                          <StepCheckbox
                            key={idx}
                            stepNumber={idx + 1}
                            title={step.title}
                            description={step.description}
                            checked={levelSteps.has(idx)}
                            onToggle={() => handleStepToggle(level.levelNumber, idx)}
                          />
                        ))}
                      </ul>
                    </div>

                    {/* Quiz */}
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg p-6 text-white">
                      <h4 className="text-2xl font-bold mb-4">🎯 Level {level.levelNumber} Challenge</h4>
                      <p className="text-lg mb-4">{level.quiz.question}</p>
                      <div className="space-y-3">
                        {level.quiz.options.map((option, idx) => {
                          const isSelected = quizAnswers[level.levelNumber] === idx
                          const showResult = showQuizResult[level.levelNumber]
                          const isCorrect = idx === level.quiz.correctIndex

                          return (
                            <button
                              key={idx}
                              onClick={() => handleQuizAnswer(level.levelNumber, idx)}
                              disabled={showResult}
                              className={`w-full p-4 rounded-lg text-left font-medium transition ${
                                showResult && isCorrect
                                  ? 'bg-green-500 text-white'
                                  : showResult && isSelected && !isCorrect
                                  ? 'bg-red-500 text-white'
                                  : isSelected
                                  ? 'bg-white/30 text-white'
                                  : 'bg-white/10 hover:bg-white/20 text-white'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}. {option}
                              {showResult && isCorrect && ' ✓'}
                              {showResult && isSelected && !isCorrect && ' ✗'}
                            </button>
                          )
                        })}
                      </div>
                      {showQuizResult[level.levelNumber] && (
                        <div className="mt-4">
                          {quizAnswers[level.levelNumber] === level.quiz.correctIndex ? (
                            <p className="text-green-200 font-bold">
                              ✓ Correct! You earned {XP_PER_QUIZ} XP!
                            </p>
                          ) : (
                            <div>
                              <p className="text-red-200 font-bold mb-3">
                                ✗ Try again! Review the content above.
                              </p>
                              <button
                                onClick={() => handleRetakeQuiz(level.levelNumber)}
                                className="px-4 py-2 bg-white text-green-600 font-medium rounded-lg hover:bg-gray-100 transition"
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
            )
          })}
        </div>

        {/* Celebration Modal */}
        {showCelebration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
              <div className="mb-6">
                <Trophy className="w-20 h-20 mx-auto" color={ROLE_COLORS.student.primary} />
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: ROLE_COLORS.student.primary }}>
                Course Complete! 🎉
              </h2>
              <p className="text-gray-600 mb-2 text-lg">
                Congratulations! You've mastered Studio Basics!
              </p>
              <p className="text-2xl font-bold mb-6" style={{ color: ROLE_COLORS.student.primary }}>
                Total XP Earned: {totalXP}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/student/dashboard')}
                  className="w-full px-6 py-3 rounded-lg text-white font-bold text-lg transition"
                  style={{ backgroundColor: ROLE_COLORS.student.primary }}
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => setShowCelebration(false)}
                  className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
