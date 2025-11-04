import apiClient from './client'

export interface ProgressEvent {
  id: number
  student_id: number
  course_id: number
  event_type: string
  level?: number
  data?: any
  timestamp: string
}

export interface StudentStats {
  current_level: number
  progress_percentage: number
  total_xp: number
  quiz_score: string
  steps_completed: number
  levels_unlocked: number
  courses_completed: number
  badges_earned: number
}

export interface LeaderboardEntry {
  student_id: number
  name: string
  email: string
  total_xp: number
  rank: number
  xp_to_next_rank?: number
}

const progressAPI = {
  // Create progress event
  createProgress: async (data: {
    student_id: number
    course_id: number
    event_type: string
    level?: number
    data?: any
  }) => {
    const response = await apiClient.post('/api/progress', data)
    return response.data
  },

  // Get student progress
  getStudentProgress: async (studentId: number) => {
    const response = await apiClient.get(`/api/progress/student/${studentId}`)
    return response.data
  },

  // Get student course progress
  getStudentCourseProgress: async (studentId: number, courseId: number) => {
    const response = await apiClient.get(
      `/api/progress/student/${studentId}/course/${courseId}`
    )
    return response.data
  },

  // Get class leaderboard
  getLeaderboard: async (
    classCode: string,
    period: 'all' | 'week' | 'month' = 'all',
    studentId?: number,
    gameId?: number
  ) => {
    const params = new URLSearchParams({
      period,
      ...(gameId && { gameId: gameId.toString() }),
      ...(studentId && { studentId: studentId.toString() }),
    })
    const response = await apiClient.get(
      `/api/progress/leaderboard/${classCode}?${params}`
    )
    return response.data
  },

  // Skip/complete a course (for students who already have prerequisite)
  skipCourse: async (data: {
    student_id: number
    course_id: number
    total_steps: number
  }) => {
    const response = await apiClient.post('/api/progress/skip-course', data)
    return response.data
  },
}

export default progressAPI