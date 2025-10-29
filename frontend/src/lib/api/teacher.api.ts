import apiClient from './client'

export interface CreateStudentRequest {
  name: string
  email: string
  pin_code?: string
}

export interface StudentResponse {
  id: number
  name: string
  email: string
  pin: string
  classCode: string
  createdAt: string
}

export interface CreateStudentResponse {
  success: boolean
  student: StudentResponse
}

export interface Student {
  id: number
  name: string
  email: string
  classCode: string
  progress: number
  totalXP: number
  badges: number
  lastActive: string
}

export interface GetStudentsResponse {
  success: boolean
  students: Student[]
}

export interface TeacherStats {
  totalStudents: number
  activeToday: number
  avgProgress: number
  totalXP: number
}

export interface GetStatsResponse {
  success: boolean
  stats: TeacherStats
}

/**
 * Create a new student (teacher only)
 */
export async function createStudent(data: CreateStudentRequest): Promise<CreateStudentResponse> {
  const response = await apiClient.post<CreateStudentResponse>('/api/teachers/students', data)
  return response.data
}

/**
 * Get all students for the logged-in teacher
 */
export async function getTeacherStudents(): Promise<GetStudentsResponse> {
  const response = await apiClient.get<GetStudentsResponse>('/api/teachers/students')
  return response.data
}

/**
 * Get teacher dashboard statistics
 */
export async function getTeacherStats(): Promise<GetStatsResponse> {
  const response = await apiClient.get<GetStatsResponse>('/api/teachers/stats')
  return response.data
}
