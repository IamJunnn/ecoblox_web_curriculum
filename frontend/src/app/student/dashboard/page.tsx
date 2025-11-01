'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, BookOpen, Trophy, Award, Loader2, ArrowRight, CheckCircle, Lock } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import progressAPI, { StudentStats, LeaderboardEntry } from '@/lib/api/progress.api'
import coursesAPI, { Course } from '@/lib/api/courses.api'
import { ROLE_COLORS } from '@/lib/theme'

interface CourseProgress {
  courseId: number
  isCompleted: boolean
  isInProgress: boolean
  completedSteps: number
  totalSteps: number
  progressPercentage: number
}

export default function StudentDashboard() {
  const { user, isAuthenticated, isInitialized } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [courseProgress, setCourseProgress] = useState<Record<number, CourseProgress>>({})
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentRank, setCurrentRank] = useState<LeaderboardEntry | null>(null)
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

    loadDashboardData()
  }, [isAuthenticated, isInitialized, user, router])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load all data in parallel
      const [progressData, coursesData, leaderboardData] = await Promise.all([
        progressAPI.getStudentProgress(user.id),
        coursesAPI.getCourses(),
        progressAPI.getLeaderboard(user.class_code || 'CLASS2025', 'week', user.id),
      ])

      const loadedCourses = coursesData.courses || coursesData || []
      setCourses(loadedCourses)
      setLeaderboard(leaderboardData.leaderboard || [])
      setCurrentRank(leaderboardData.current_student)

      // Calculate progress for each course
      const progressMap: Record<number, CourseProgress> = {}
      for (const course of loadedCourses) {
        try {
          const courseProgressData = await progressAPI.getStudentCourseProgress(user.id, course.id)
          const events = courseProgressData.progress_events || []

          // Count completed steps (only those with is_checked = true)
          const completedSteps = new Set()
          console.log(`[Course ${course.id}] Total events:`, events.length)
          events.forEach((event: any) => {
            if (event.event_type === 'step_checked') {
              const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
              const stepKey = `${event.level}-${data.step}`
              // Only count if is_checked is true (or undefined for backward compatibility)
              const isChecked = event.is_checked !== false
              console.log(`[Course ${course.id}] Step event - Level: ${event.level}, Step: ${data.step}, is_checked: ${event.is_checked}, Key: ${stepKey}`)

              if (isChecked) {
                completedSteps.add(stepKey)
              }
            }
          })
          console.log(`[Course ${course.id}] Unique completed steps:`, Array.from(completedSteps))

          // Get total steps from course data (stored in database)
          const totalSteps = course.total_steps || 0
          console.log(`[Course ${course.id}] total_steps from DB: ${course.total_steps}, using: ${totalSteps}`)

          const isCompleted = totalSteps > 0 && completedSteps.size >= totalSteps
          const isInProgress = completedSteps.size > 0 && !isCompleted
          const progressPercentage = totalSteps > 0 ? Math.round((completedSteps.size / totalSteps) * 100) : 0

          console.log(`Course ${course.id} (${course.title}):`, {
            totalSteps,
            completedSteps: completedSteps.size,
            isCompleted,
            isInProgress,
            progressPercentage,
            steps: Array.from(completedSteps)
          })

          progressMap[course.id] = {
            courseId: course.id,
            isCompleted,
            isInProgress,
            completedSteps: completedSteps.size,
            totalSteps,
            progressPercentage
          }
        } catch (error) {
          console.error(`Failed to load progress for course ${course.id}:`, error)
        }
      }
      setCourseProgress(progressMap)

      // Calculate overall progress based on completed courses (not steps)
      let completedCoursesCount = 0
      let totalCoursesCount = loadedCourses.length

      for (const course of loadedCourses) {
        if (progressMap[course.id] && progressMap[course.id].isCompleted) {
          completedCoursesCount++
          console.log(`[Overall] Course ${course.id} (${course.title}): COMPLETED ✓`)
        } else {
          console.log(`[Overall] Course ${course.id} (${course.title}): ${progressMap[course.id]?.isInProgress ? 'IN PROGRESS' : 'NOT STARTED'}`)
        }
      }

      const overallProgress = totalCoursesCount > 0 ? Math.round((completedCoursesCount / totalCoursesCount) * 100) : 0
      console.log(`[Overall] Progress: ${completedCoursesCount}/${totalCoursesCount} courses completed = ${overallProgress}%`)

      // Update stats with calculated overall progress
      setStats({
        ...progressData.stats,
        progress_percentage: overallProgress
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Use fallback data if API fails
      setCourses([])
      setStats({
        current_level: 0,
        progress_percentage: 0,
        total_xp: 0,
        quiz_score: '0/0',
        steps_completed: 0,
        levels_unlocked: 0,
        courses_completed: 0,
        badges_earned: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (!isInitialized || loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>Student Dashboard</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" color={ROLE_COLORS.student.primary} />
          <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>Student Dashboard</h1>
      </div>
      <p className="text-gray-600 -mt-6 mb-8">Welcome back, {user?.name}!</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total XP</span>
            <Star className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-500">{stats?.total_xp || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Courses</span>
            <BookOpen className="w-8 h-8" style={{ color: ROLE_COLORS.student.primary }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>
            {stats?.courses_completed || 0}/{courses.length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Class Rank</span>
            <Trophy className="w-8 h-8" style={{ color: ROLE_COLORS.student.primary }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>#{currentRank?.rank || '-'}</p>
        </div>

        <Link href="/student/badge-gallery">
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Badges</span>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-yellow-500">{stats?.badges_earned || 0}</p>
            <p className="text-xs text-gray-500 mt-2">Click to view gallery</p>
          </div>
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h2>
        <div className="flex mb-2 items-center justify-between">
          <span
            className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full"
            style={{
              color: ROLE_COLORS.student.primary,
              backgroundColor: ROLE_COLORS.student.light
            }}
          >
            Progress
          </span>
          <span className="text-xs font-semibold inline-block" style={{ color: ROLE_COLORS.student.primary }}>
            {stats?.progress_percentage || 0}%
          </span>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded" style={{ backgroundColor: ROLE_COLORS.student.light }}>
          <div
            style={{
              width: `${stats?.progress_percentage || 0}%`,
              backgroundColor: ROLE_COLORS.student.primary
            }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Courses */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {courses.length > 0 ? (
                courses.map((course) => {
                  const progress = courseProgress[course.id]
                  const isCompleted = progress?.isCompleted || false
                  const isInProgress = progress?.isInProgress || false
                  const progressPercentage = progress?.progressPercentage || 0
                  const isLocked = course.isLocked || false

                  // Find prerequisite course name
                  let prerequisiteCourseName = ''
                  if (isLocked && course.requires_course) {
                    const prerequisiteCourse = courses.find(c => c.id === course.requires_course)
                    prerequisiteCourseName = prerequisiteCourse?.title || 'the previous course'
                  }

                  return (
                    <Link
                      key={course.id}
                      href={isLocked ? '#' : `/courses/${course.id}`}
                      className={`block border rounded-lg p-4 transition group ${
                        isLocked
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                          : isCompleted
                          ? 'bg-green-50 border-green-300 hover:bg-green-100'
                          : isInProgress
                          ? 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                          : 'hover:bg-gray-50 hover:border-green-300'
                      }`}
                      onClick={(e) => {
                        if (isLocked) {
                          e.preventDefault()
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {isLocked ? (
                              <Lock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            ) : isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            ) : null}
                            <h3 className={`font-medium transition ${
                              isLocked
                                ? 'text-gray-500'
                                : isCompleted
                                ? 'text-green-700'
                                : isInProgress
                                ? 'text-blue-700'
                                : 'text-gray-900 group-hover:text-green-600'
                            }`}>
                              {course.title}
                            </h3>
                            {!isLocked && (
                              <ArrowRight className={`w-4 h-4 transition-all ${
                                isCompleted
                                  ? 'text-green-600'
                                  : isInProgress
                                  ? 'text-blue-600'
                                  : 'text-gray-400 group-hover:text-green-600 group-hover:translate-x-1'
                              }`} />
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
                            {course.description}
                          </p>
                          {isLocked && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-md w-fit">
                              <Lock className="w-3 h-3" />
                              <span>Complete &quot;{prerequisiteCourseName}&quot; to unlock</span>
                            </div>
                          )}
                          {isInProgress && !isCompleted && !isLocked && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-blue-700 font-medium">In Progress</span>
                                <span className="text-blue-700">{progressPercentage}%</span>
                              </div>
                              <div className="w-full bg-blue-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No courses available yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Class Leaderboard (This Week)</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <div
                    key={entry.student_id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      entry.student_id === user?.id ? 'border-2' : 'bg-gray-50'
                    }`}
                    style={entry.student_id === user?.id ? {
                      backgroundColor: ROLE_COLORS.student.light,
                      borderColor: ROLE_COLORS.student.primary
                    } : {}}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-gray-600'
                      }`}>
                        {entry.rank}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {entry.name}
                          {entry.student_id === user?.id && (
                            <span className="ml-2" style={{ color: ROLE_COLORS.student.primary }}>(You)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{entry.total_xp} XP</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No leaderboard data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
