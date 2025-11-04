import apiClient from './client'

export interface Course {
  id: number
  game_id: number // Which game this course belongs to
  title: string
  description?: string
  total_levels?: number // Deprecated - use total_steps instead
  total_steps: number // Total number of steps in the course
  url?: string
  display_order: number
  course_order: number // Course order within the game (1, 2, 3, 4)
  created_at: string
  badge_name?: string
  badge_icon?: string
  badge_message?: string
  isLocked?: boolean
  prerequisiteCourseName?: string
  requires_course?: number
}

const coursesAPI = {
  // Get all courses
  getCourses: async () => {
    const response = await apiClient.get('/api/courses')
    return response.data
  },

  // Get single course
  getCourse: async (courseId: number) => {
    const response = await apiClient.get(`/api/courses/${courseId}`)
    return response.data.course
  },
}

export default coursesAPI