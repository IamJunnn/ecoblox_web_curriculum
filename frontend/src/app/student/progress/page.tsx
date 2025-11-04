'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Star,
  BookOpen,
  Trophy,
  Award,
  Loader2,
  TrendingUp,
  CheckCircle,
  Circle,
  Clock,
  Target,
  Calendar
} from 'lucide-react'
import useAuthStore from '@/store/authStore'
import progressAPI, { StudentStats, ProgressEvent } from '@/lib/api/progress.api'
import coursesAPI, { Course } from '@/lib/api/courses.api'
import { ROLE_COLORS } from '@/lib/theme'

interface CourseProgress {
  course: Course
  completedSteps: number
  totalSteps: number
  progressPercentage: number
  isCompleted: boolean
  isInProgress: boolean
  lastActivity?: string
  events: ProgressEvent[]
}

interface XPHistory {
  date: string
  xp: number
  events: number
}

export default function StudentProgress() {
  const { user, isAuthenticated, isInitialized } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
  const [xpHistory, setXPHistory] = useState<XPHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isInitialized) {
      return
    }

    if (!isAuthenticated || user?.role !== 'student') {
      router.push('/')
      return
    }

    loadProgressData()
  }, [isAuthenticated, isInitialized, user, router])

  const loadProgressData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load progress and courses
      const [progressData, coursesData] = await Promise.all([
        progressAPI.getStudentProgress(user.id),
        coursesAPI.getCourses(),
      ])

      const loadedCourses = coursesData.courses || coursesData || []

      // Calculate detailed progress for each course
      const progressList: CourseProgress[] = []

      for (const course of loadedCourses) {
        try {
          const courseProgressData = await progressAPI.getStudentCourseProgress(user.id, course.id)
          const events = courseProgressData.progress_events || []

          // Count completed steps
          const completedSteps = new Set()
          let lastActivity: string | undefined

          events.forEach((event: any) => {
            if (event.event_type === 'step_checked') {
              const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
              const stepKey = `${event.level}-${data.step}`
              const isChecked = event.is_checked !== false

              if (isChecked) {
                completedSteps.add(stepKey)
                if (!lastActivity || new Date(event.timestamp) > new Date(lastActivity)) {
                  lastActivity = event.timestamp
                }
              }
            }
          })

          const totalSteps = course.total_steps || 0
          const completedCount = completedSteps.size
          const progressPercentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0
          const isCompleted = totalSteps > 0 && completedCount >= totalSteps
          const isInProgress = completedCount > 0 && !isCompleted

          progressList.push({
            course,
            completedSteps: completedCount,
            totalSteps,
            progressPercentage,
            isCompleted,
            isInProgress,
            lastActivity,
            events
          })
        } catch (error) {
          console.error(`Failed to load progress for course ${course.id}:`, error)
        }
      }

      setCourseProgress(progressList)

      // Calculate overall progress
      const completedCoursesCount = progressList.filter(p => p.isCompleted).length
      const totalCoursesCount = loadedCourses.length
      const overallProgress = totalCoursesCount > 0 ? Math.round((completedCoursesCount / totalCoursesCount) * 100) : 0

      setStats({
        ...progressData.stats,
        progress_percentage: overallProgress,
        courses_completed: completedCoursesCount
      })

      // Calculate XP history from progress events
      calculateXPHistory(progressList)
    } catch (error) {
      console.error('Failed to load progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateXPHistory = (progressList: CourseProgress[]) => {
    // Aggregate all events by date
    const eventsByDate: { [date: string]: number } = {}

    progressList.forEach(progress => {
      progress.events.forEach(event => {
        const date = new Date(event.timestamp).toLocaleDateString()
        eventsByDate[date] = (eventsByDate[date] || 0) + 1
      })
    })

    // Convert to history array (last 7 days)
    const history: XPHistory[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString()

      history.push({
        date: dateStr,
        xp: (eventsByDate[dateStr] || 0) * 10, // Approximate XP (10 per step)
        events: eventsByDate[dateStr] || 0
      })
    }

    setXPHistory(history)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  if (!isInitialized || loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: ROLE_COLORS.student.primary }}>
          My Progress
        </h1>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" color={ROLE_COLORS.student.primary} />
          <span className="ml-3 text-lg text-gray-600">Loading progress...</span>
        </div>
      </div>
    )
  }

  const maxXP = Math.max(...xpHistory.map(h => h.xp), 1)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>
          My Progress
        </h1>
        <Link
          href="/student/dashboard"
          className="text-sm text-gray-600 hover:text-gray-900 transition"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total XP</span>
            <Star className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-500">{stats?.total_xp || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Keep learning!</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Courses Completed</span>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-500">
            {stats?.courses_completed || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Out of {courseProgress.length} total</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Steps Completed</span>
            <Target className="w-6 h-6" style={{ color: ROLE_COLORS.student.primary }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>
            {courseProgress.reduce((sum, p) => sum + p.completedSteps, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total steps</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Badges Earned</span>
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">{stats?.badges_earned || 0}</p>
          <p className="text-xs text-gray-500 mt-1">
            <Link href="/student/badge-gallery" className="hover:underline">
              View gallery
            </Link>
          </p>
        </div>
      </div>

      {/* XP Activity Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5" style={{ color: ROLE_COLORS.student.primary }} />
          <h2 className="text-lg font-semibold text-gray-900">XP Activity (Last 7 Days)</h2>
        </div>

        <div className="flex items-end justify-between gap-2 h-40">
          {xpHistory.map((day, index) => {
            const heightPercent = maxXP > 0 ? (day.xp / maxXP) * 100 : 0
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full flex items-end justify-center h-32">
                  {day.xp > 0 && (
                    <div className="absolute bottom-0 text-xs font-medium" style={{ color: ROLE_COLORS.student.primary, bottom: `${heightPercent}%` }}>
                      {day.xp}
                    </div>
                  )}
                  <div
                    className="w-full rounded-t-lg transition-all duration-300"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: day.xp > 0 ? ROLE_COLORS.student.primary : '#E5E7EB',
                      minHeight: '4px'
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 text-center">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Course Progress */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: ROLE_COLORS.student.primary }} />
            <h2 className="text-lg font-semibold text-gray-900">Course Progress Details</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {courseProgress.length > 0 ? (
              courseProgress.map((progress) => (
                <div
                  key={progress.course.id}
                  className="border rounded-lg p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {progress.isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : progress.isInProgress ? (
                        <Circle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{progress.course.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{progress.course.description}</p>
                      </div>
                    </div>
                    <Link
                      href={`/courses/${progress.course.id}`}
                      className="px-3 py-1.5 text-sm rounded-lg transition whitespace-nowrap"
                      style={{
                        backgroundColor: ROLE_COLORS.student.light,
                        color: ROLE_COLORS.student.primary
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = ROLE_COLORS.student.primary
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = ROLE_COLORS.student.light
                        e.currentTarget.style.color = ROLE_COLORS.student.primary
                      }}
                    >
                      {progress.isCompleted ? 'Review' : 'Continue'}
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {progress.completedSteps} / {progress.totalSteps} steps
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        Last activity: {formatDate(progress.lastActivity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        Status: {progress.isCompleted ? 'Completed' : progress.isInProgress ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-gray-700">Progress</span>
                      <span className="font-semibold" style={{ color: ROLE_COLORS.student.primary }}>
                        {progress.progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${progress.progressPercentage}%`,
                          backgroundColor: progress.isCompleted ? '#10B981' : ROLE_COLORS.student.primary
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No courses available yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-lg shadow mt-8 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Achievements</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>Keep learning to unlock achievements!</p>
          <Link
            href="/student/badge-gallery"
            className="text-sm mt-2 inline-block"
            style={{ color: ROLE_COLORS.student.primary }}
          >
            View Badge Gallery
          </Link>
        </div>
      </div>
    </div>
  )
}
