'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, ExternalLink, CheckCircle } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import progressAPI from '@/lib/api/progress.api'
import CourseHeader from '@/components/courses/CourseHeader'
import StepCheckbox from '@/components/courses/StepCheckbox'
import ProgressBar from '@/components/courses/ProgressBar'
import { ROLE_COLORS } from '@/lib/theme'

interface Course {
  id: number
  title: string
  description: string
  total_levels: number
}

interface CreateRobloxAccountProps {
  course: Course
}

const SIGNUP_URL = 'https://www.roblox.com/account/signupredir'
const ROBLOX_DOCS_URL = 'https://create.roblox.com/docs/tutorials/curriculums/studio/create-account'

export default function CreateRobloxAccount({ course }: CreateRobloxAccountProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [showCelebration, setShowCelebration] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)

  const steps = [
    {
      number: 1,
      title: 'Visit Roblox Sign Up Page',
      description: 'Click the button above to open the Roblox account creation page'
    },
    {
      number: 2,
      title: 'Enter Your Birthday',
      description: 'Fill in your date of birth (Month, Day, Year)'
    },
    {
      number: 3,
      title: 'Create Username',
      description: 'Choose a unique username for your Roblox account'
    },
    {
      number: 4,
      title: 'Set Password',
      description: 'Create a strong password to secure your account'
    },
    {
      number: 5,
      title: 'Select Gender (Optional)',
      description: 'Choose your gender or skip this step'
    },
    {
      number: 6,
      title: 'Complete Sign Up',
      description: 'Click "Sign Up" to create your account'
    },
    {
      number: 7,
      title: 'Verify Your Account',
      description: 'Check your email (if provided) or verify through the website'
    }
  ]

  useEffect(() => {
    // Load progress from API
    if (user) {
      loadProgress()
    }
  }, [user])

  const loadProgress = async () => {
    try {
      if (!user) return

      // Load progress from backend
      const response = await progressAPI.getStudentCourseProgress(user.id, course.id)
      const events = response.progress_events || []

      // Extract completed steps
      const completed = new Set<number>()
      events.forEach((event: any) => {
        if (event.event_type === 'step_checked') {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
          // Convert back from 0-indexed to 1-indexed
          completed.add(data.step + 1)
        }
      })

      setCompletedSteps(completed)
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  const handleStepToggle = async (stepNumber: number) => {
    const newCompleted = new Set(completedSteps)

    if (newCompleted.has(stepNumber)) {
      newCompleted.delete(stepNumber)
    } else {
      newCompleted.add(stepNumber)

      // Track progress event
      if (user) {
        try {
          await progressAPI.createProgress({
            student_id: user.id,
            course_id: course.id,
            event_type: 'step_checked',
            level: 1, // Create Account is treated as level 1
            data: { step: stepNumber - 1 } // Convert to 0-indexed
          })
        } catch (error) {
          console.error('Failed to track progress:', error)
        }
      }
    }

    setCompletedSteps(newCompleted)

    // Check if all steps are completed
    if (newCompleted.size === steps.length) {
      setShowCelebration(true)

      // Track quest and course completion
      if (user) {
        try {
          // Track quest completion
          await progressAPI.createProgress({
            student_id: user.id,
            course_id: course.id,
            event_type: 'quest_completed',
            level: 0,
            data: { all_steps_completed: true }
          })

          // Track course completion (for dashboard stats)
          await progressAPI.createProgress({
            student_id: user.id,
            course_id: course.id,
            event_type: 'course_completed',
            level: 1,
            data: { quest: 'create_roblox_account' }
          })
        } catch (error) {
          console.error('Failed to track completion:', error)
        }
      }
    }
  }

  const handleOpenSignUp = () => {
    window.open(SIGNUP_URL, '_blank')
  }

  const handleOpenDocs = () => {
    window.open(ROBLOX_DOCS_URL, '_blank')
  }

  const handleSkipCourse = async () => {
    if (!user) return

    if (!window.confirm('Are you sure you already have a Roblox account? This will mark all steps as complete.')) {
      return
    }

    setIsSkipping(true)

    try {
      // Call API to skip/complete the course
      const result = await progressAPI.skipCourse({
        student_id: user.id,
        course_id: course.id,
        total_steps: steps.length
      })

      if (result.success) {
        // Mark all steps as completed locally
        const allSteps = new Set(steps.map(s => s.number))
        setCompletedSteps(allSteps)

        // Show celebration
        setShowCelebration(true)
      } else {
        alert('Failed to skip course. Please try again.')
      }
    } catch (error) {
      console.error('Failed to skip course:', error)
      alert('Failed to skip course. Please try again.')
    } finally {
      setIsSkipping(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: ROLE_COLORS.student.light }}>
      <CourseHeader
        title={course.title}
        subtitle={course.description}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Account Creation Progress</h2>
            <button
              onClick={handleSkipCourse}
              disabled={isSkipping || completedSteps.size === steps.length}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
            >
              <CheckCircle className="w-5 h-5" />
              {isSkipping ? 'Processing...' : 'Already Have Account?'}
            </button>
          </div>
          <ProgressBar
            current={completedSteps.size}
            total={steps.length}
            label={`${completedSteps.size} of ${steps.length} steps completed`}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Sign Up Button */}
          <div
            className="rounded-lg shadow-lg p-6 text-white text-center"
            style={{ background: `linear-gradient(to right, ${ROLE_COLORS.student.primary}, ${ROLE_COLORS.student.dark})` }}
          >
            <h3 className="text-xl font-bold mb-3">Create Your Account</h3>
            <p className="mb-4 text-sm opacity-90">
              Sign up for a free Roblox account
            </p>
            <button
              onClick={handleOpenSignUp}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg font-bold hover:bg-gray-100 transition shadow-lg"
              style={{ color: ROLE_COLORS.student.primary }}
            >
              <ExternalLink className="w-5 h-5" />
              Sign Up on Roblox
            </button>
          </div>

          {/* Tutorial Link */}
          <div
            className="rounded-lg shadow-lg p-6 text-white text-center"
            style={{ background: `linear-gradient(to right, ${ROLE_COLORS.teacher.primary}, ${ROLE_COLORS.teacher.dark})` }}
          >
            <h3 className="text-xl font-bold mb-3">Need Help?</h3>
            <p className="mb-4 text-sm opacity-90">
              Follow the official Roblox tutorial
            </p>
            <button
              onClick={handleOpenDocs}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg font-bold hover:bg-gray-100 transition shadow-lg"
              style={{ color: ROLE_COLORS.teacher.primary }}
            >
              <ExternalLink className="w-5 h-5" />
              View Tutorial
            </button>
          </div>
        </div>

        {/* Account Creation Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Creation Steps</h2>
          <ul className="space-y-4">
            {steps.map(step => (
              <StepCheckbox
                key={step.number}
                stepNumber={step.number}
                title={step.title}
                description={step.description}
                checked={completedSteps.has(step.number)}
                onToggle={() => handleStepToggle(step.number)}
              />
            ))}
          </ul>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-yellow-900 mb-3">Important Tips:</h3>
          <ul className="space-y-2 text-yellow-800">
            <li className="flex items-start gap-2">
              <span className="font-bold mt-1">•</span>
              <span>Choose a username you'll remember - it cannot be changed later!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-1">•</span>
              <span>Use a strong password to keep your account secure</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-1">•</span>
              <span>Adding an email helps recover your account if you forget your password</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-1">•</span>
              <span>If you're under 13, some features may be restricted for safety</span>
            </li>
          </ul>
        </div>

        {/* Celebration Modal */}
        {showCelebration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
              <div className="mb-6">
                <Trophy className="w-20 h-20 mx-auto" color={ROLE_COLORS.student.primary} />
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: ROLE_COLORS.student.primary }}>
                Quest Complete! 🎉
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Awesome! You've created your Roblox account.
                You're ready to start creating amazing games!
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
