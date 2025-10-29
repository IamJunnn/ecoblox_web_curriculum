'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useAuthStore from '@/store/authStore'
import coursesAPI from '@/lib/api/courses.api'
import { Loader2 } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'
import InstallRobloxStudio from './InstallRobloxStudio'
import StudioBasics from './StudioBasics'

interface Course {
  id: number
  title: string
  description: string
  total_levels: number
  url: string
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

  // Render the appropriate course component based on courseId
  if (courseId === 4) {
    return <InstallRobloxStudio course={course} />
  } else if (courseId === 1) {
    return <StudioBasics course={course} />
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
