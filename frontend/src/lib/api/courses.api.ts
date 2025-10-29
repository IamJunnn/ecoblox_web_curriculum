import apiClient from './client'

export interface Course {
  id: number
  title: string
  description?: string
  total_levels: number
  url?: string
  display_order: number
  created_at: string
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