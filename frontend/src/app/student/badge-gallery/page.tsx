'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Lock, ArrowLeft } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import progressAPI from '@/lib/api/progress.api'
import coursesAPI, { Course } from '@/lib/api/courses.api'
import { ROLE_COLORS } from '@/lib/theme'

interface Badge {
  id: number
  user_id: number
  course_id: number
  badge_name: string
  earned_at: string
}

interface BadgeWithCourse extends Badge {
  course: Course
  badge_icon: string
  badge_message: string
}

export default function BadgeGallery() {
  const { user, isAuthenticated, isInitialized } = useAuthStore()
  const router = useRouter()
  const [badges, setBadges] = useState<BadgeWithCourse[]>([])
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for auth to be initialized before checking
    if (!isInitialized) {
      return
    }

    if (!isAuthenticated || user?.role !== 'student') {
      router.push('/')
      return
    }

    loadBadges()
  }, [isAuthenticated, isInitialized, user, router])

  const loadBadges = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load student progress and courses in parallel
      const [progressData, coursesData] = await Promise.all([
        progressAPI.getStudentProgress(user.id),
        coursesAPI.getCourses(),
      ])

      const earnedBadges = progressData.badges || []
      const courses = coursesData.courses || coursesData || []
      setAllCourses(courses)

      // Combine badge data with course info
      const badgesWithCourses: BadgeWithCourse[] = earnedBadges.map((badge: Badge) => {
        const course = courses.find((c: Course) => c.id === badge.course_id)
        return {
          ...badge,
          course: course!,
          badge_icon: course?.badge_icon || '🏆',
          badge_message: course?.badge_message || 'Badge earned!',
        }
      })

      setBadges(badgesWithCourses)
    } catch (error) {
      console.error('Failed to load badges:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get locked badges (courses not yet completed)
  const lockedBadges = allCourses.filter(
    (course) => !badges.some((badge) => badge.course_id === course.id)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 animate-pulse mx-auto mb-4" color={ROLE_COLORS.student.primary} />
          <p className="text-gray-600">Loading badges...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: ROLE_COLORS.student.light }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/student/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <Trophy className="w-10 h-10 text-yellow-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Badge Gallery</h1>
              <p className="text-gray-600">
                {badges.length} of {allCourses.length} badges earned
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Earned Badges */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Earned Badges</h2>
          {badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-white rounded-xl shadow-lg p-6 text-center border-2 transition hover:shadow-xl"
                  style={{ borderColor: ROLE_COLORS.student.primary }}
                >
                  <div className="text-6xl mb-4">{badge.badge_icon}</div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: ROLE_COLORS.student.primary }}>
                    {badge.badge_name}
                  </h3>
                  <p className="text-gray-700 mb-3">{badge.badge_message}</p>
                  <div className="text-sm text-gray-500 mb-2">
                    <strong>Course:</strong> {badge.course.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    Earned on {new Date(badge.earned_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 text-lg">
                You haven't earned any badges yet. Complete courses to earn badges!
              </p>
            </div>
          )}
        </section>

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Locked Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedBadges.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-lg p-6 text-center border-2 border-gray-200 opacity-60"
                >
                  <div className="relative mb-4">
                    <div className="text-6xl grayscale">{course.badge_icon || '🏆'}</div>
                    <Lock className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-500 mb-2">
                    {course.badge_name || 'Mystery Badge'}
                  </h3>
                  <p className="text-gray-500 mb-3">Complete the course to unlock!</p>
                  <div className="text-sm text-gray-400">
                    <strong>Course:</strong> {course.title}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
