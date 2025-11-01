'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useAuthStore from '@/store/authStore'
import coursesAPI from '@/lib/api/courses.api'
import { Loader2, Lock, AlertCircle } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'
import InstallRobloxStudio from './InstallRobloxStudio'
import CreateRobloxAccount from './CreateRobloxAccount'
import StudioBasics from './StudioBasics'
import GameVision from './GameVision'

interface Course {
  id: number
  title: string
  description: string
  total_levels: number
  url: string
  isLocked?: boolean
  prerequisiteCourseName?: string
  requires_course?: number
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, isInitialized } = useAuthStore()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const courseId = parseInt(params.courseId as string)

  useEffect(() => {
    // Wait for auth to be initialized before checking
    if (!isInitialized) {
      return
    }

    if (!isAuthenticated) {
      router.push('/')
      return
    }

    loadCourse()
  }, [isAuthenticated, isInitialized, courseId])

  const loadCourse = async () => {
    try {
      setLoading(true)
      const courseData = await coursesAPI.getCourse(courseId)
      setCourse(courseData)
    } catch (err: any) {
      console.error('Failed to load course:', err)
      setError(err.response?.data?.message || 'Course not found')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication or loading course
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto" color={ROLE_COLORS.student.primary} />
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The course you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="px-6 py-2 rounded-lg text-white font-medium transition"
            style={{ backgroundColor: ROLE_COLORS.student.primary }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Check if course is locked
  if (course.isLocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Course Locked</h2>
          <p className="text-gray-600 mb-2">
            You need to complete <span className="font-semibold">&quot;{course.prerequisiteCourseName || 'the previous course'}&quot;</span> before accessing this course.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Finish all the steps and quests in the prerequisite course to unlock <span className="font-semibold">&quot;{course.title}&quot;</span>.
          </p>
          <div className="flex flex-col gap-3">
            {course.requires_course && (
              <button
                onClick={() => router.push(`/courses/${course.requires_course}`)}
                className="px-6 py-3 rounded-lg text-white font-medium transition hover:opacity-90"
                style={{ backgroundColor: ROLE_COLORS.student.primary }}
              >
                Go to {course.prerequisiteCourseName}
              </button>
            )}
            <button
              onClick={() => router.push('/student/dashboard')}
              className="px-6 py-3 rounded-lg border-2 font-medium transition hover:bg-gray-50"
              style={{
                borderColor: ROLE_COLORS.student.primary,
                color: ROLE_COLORS.student.primary
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render the appropriate course component based on courseId
  if (courseId === 1) {
    return <InstallRobloxStudio course={course} />
  } else if (courseId === 2) {
    return <CreateRobloxAccount course={course} />
  } else if (courseId === 3) {
    return <StudioBasics course={course} />
  } else if (courseId === 4) {
    return <GameVision course={course} />
  }

  // Fallback for courses that don't have components yet
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{course.title}</h2>
        <p className="text-gray-600 mb-6">This course is under development.</p>
        <button
          onClick={() => router.push('/student/dashboard')}
          className="px-6 py-2 rounded-lg text-white font-medium transition"
          style={{ backgroundColor: ROLE_COLORS.student.primary }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
