'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Download } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import progressAPI from '@/lib/api/progress.api'
import coursesAPI from '@/lib/api/courses.api'
import CourseHeader from '@/components/courses/CourseHeader'
import StepCheckbox from '@/components/courses/StepCheckbox'
import ProgressBar from '@/components/courses/ProgressBar'
import ConfirmDialog from '@/components/modals/ConfirmDialog'
import { ROLE_COLORS } from '@/lib/theme'

interface Course {
  id: number
  title: string
  description: string
  total_levels: number
}

interface InstallRobloxStudioProps {
  course: Course
}

const DOWNLOAD_URL = 'https://www.roblox.com/create'

export default function InstallRobloxStudio({ course }: InstallRobloxStudioProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [showCelebration, setShowCelebration] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [earnedBadge, setEarnedBadge] = useState<any>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const steps = [
    {
      number: 1,
      title: 'Download Studio',
      description: 'Click the download button above to get Roblox Studio installer'
    },
    {
      number: 2,
      title: 'Confirm Download',
      description: 'Check your browser downloads to confirm the file is downloading'
    },
    {
      number: 3,
      title: 'Locate the Installer',
      description: 'Find "RobloxStudio.exe" in your Downloads folder'
    },
    {
      number: 4,
      title: 'Launch Studio',
      description: 'Double-click the installer and follow the setup wizard'
    },
    {
      number: 5,
      title: 'Complete Installation',
      description: 'Wait for installation to finish and launch Roblox Studio'
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
            level: 1, // Install Studio is treated as level 1
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

          // Track course completion (for dashboard stats) and get badge info
          const result = await progressAPI.createProgress({
            student_id: user.id,
            course_id: course.id,
            event_type: 'course_completed',
            level: 1,
            data: { quest: 'install_roblox_studio' }
          })

          // Store badge info if returned
          if (result.badge) {
            setEarnedBadge(result.badge)
          }
        } catch (error) {
          console.error('Failed to track completion:', error)
        }
      }

      setShowCelebration(true)
    }
  }

  const handleDownload = () => {
    window.open(DOWNLOAD_URL, '_blank')
  }

  const handleSkipCourseClick = () => {
    setShowConfirmDialog(true)
  }

  const handleSkipCourse = async () => {
    if (!user) return

    setShowConfirmDialog(false)
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

        // Fetch badge info
        try {
          const progressResult = await progressAPI.getStudentProgress(user.id)
          const badge = progressResult.badges?.find((b: any) => b.course_id === course.id)

          if (badge) {
            // Get course info to get badge details
            const courseData = await coursesAPI.getCourse(course.id)
            setEarnedBadge({
              badge_name: courseData.badge_name,
              badge_icon: courseData.badge_icon,
              badge_message: courseData.badge_message,
            })
          }
        } catch (error) {
          console.error('Failed to fetch badge:', error)
        }

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
            <h2 className="text-2xl font-bold text-gray-900">Installation Progress</h2>
            <button
              onClick={handleSkipCourseClick}
              disabled={isSkipping || completedSteps.size === steps.length}
              className="px-5 py-2.5 bg-white border-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: ROLE_COLORS.student.primary,
                color: ROLE_COLORS.student.primary,
              }}
              onMouseEnter={(e) => {
                if (!isSkipping && completedSteps.size !== steps.length) {
                  e.currentTarget.style.backgroundColor = ROLE_COLORS.student.primary
                  e.currentTarget.style.color = 'white'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSkipping && completedSteps.size !== steps.length) {
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.color = ROLE_COLORS.student.primary
                }
              }}
            >
              {isSkipping ? 'Processing...' : 'Already Installed?'}
            </button>
          </div>
          <ProgressBar
            current={completedSteps.size}
            total={steps.length}
            label={`${completedSteps.size} of ${steps.length} steps completed`}
          />
        </div>

        {/* Download Button */}
        <div
          className="rounded-lg shadow-lg p-8 mb-8 text-white text-center"
          style={{ background: `linear-gradient(to right, ${ROLE_COLORS.student.primary}, ${ROLE_COLORS.student.dark})` }}
        >
          <h3 className="text-2xl font-bold mb-4">Ready to Install?</h3>
          <p className="mb-6 text-lg opacity-90">
            Click the button below to download Roblox Studio
          </p>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
            style={{ color: ROLE_COLORS.student.primary }}
          >
            <Download className="w-6 h-6" />
            Download Roblox Studio
          </button>
        </div>

        {/* Installation Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Installation Steps</h2>
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

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Already have Roblox Studio installed?"
          message="This will mark all steps as complete."
          confirmText="OK"
          cancelText="Cancel"
          onConfirm={handleSkipCourse}
          onCancel={() => setShowConfirmDialog(false)}
          variant="success"
          icon="check"
        />

        {/* Celebration Modal */}
        {showCelebration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
              {/* Badge Display */}
              {earnedBadge ? (
                <div className="mb-6">
                  <div className="text-6xl mb-4">{earnedBadge.badge_icon}</div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: ROLE_COLORS.student.primary }}>
                    {earnedBadge.badge_name}
                  </h2>
                  <p className="text-xl text-gray-700 font-medium mb-4">
                    {earnedBadge.badge_message}
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                    <Trophy className="w-5 h-5" color={ROLE_COLORS.student.primary} />
                    <span className="text-sm font-semibold" style={{ color: ROLE_COLORS.student.primary }}>
                      Badge Earned!
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <Trophy className="w-20 h-20 mx-auto" color={ROLE_COLORS.student.primary} />
                  <h2 className="text-3xl font-bold mt-4" style={{ color: ROLE_COLORS.student.primary }}>
                    Quest Complete! 🎉
                  </h2>
                </div>
              )}

              <p className="text-gray-600 mb-6 text-lg">
                Congratulations! You've successfully installed Roblox Studio.
                Ready to start your creative journey?
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
