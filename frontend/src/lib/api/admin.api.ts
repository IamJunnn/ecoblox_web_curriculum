import apiClient from './client'

export interface StudentDetail {
  id: number
  name: string
  email: string
  pin: string
  classCode: string
  progress: number
  totalXP: number
  coursesCompleted: number
  totalCourses: number
  badgesEarned: number
  lastActive: string
  createdAt: string
  teacher: {
    id: number
    name: string
    email: string
    classCode: string
  } | null
}

export interface CourseProgress {
  courseId: number
  courseName: string
  completed: boolean
  progress: number
  xp: number
  lastAccessed: string
}

export interface GetStudentResponse {
  success: boolean
  student: StudentDetail
  courseProgress: CourseProgress[]
}

export interface UpdateStudentDto {
  name?: string
  email?: string
  pin_code?: string
  teacher_id?: number
  game_id?: number
  parent_email?: string
}

export interface UpdateStudentResponse {
  success: boolean
  student: {
    id: number
    name: string
    email: string
    pin: string
  }
}

export interface GeneratePinResponse {
  success: boolean
  pin: string
  message: string
}

export interface ResetProgressResponse {
  success: boolean
  message: string
}

export interface DeleteStudentResponse {
  success: boolean
  message: string
}

export interface CreateTeacherDto {
  name: string
  email: string
  class_code?: string
}

export interface CreateTeacherResponse {
  success: boolean
  teacher: {
    id: number
    name: string
    email: string
    class_code: string
    role: string
    is_verified: boolean
  }
  invitation_token: string
  invitation_link: string
}

export interface Teacher {
  id: number
  name: string
  email: string
  class_codes: Array<{ code: string; game: { name: string } }>
  is_verified: boolean
  created_at: string
  last_active: string
  student_count: number
}

export interface GetAllTeachersResponse {
  success: boolean
  teachers: Teacher[]
  count: number
}

export interface Student {
  id: number
  name: string
  email: string
  pin_code: string
  class_code: string
  created_by_teacher_id: number | null
  teacher_name: string | null
  progress: number
  totalXP: number
  badges: number
  last_active: string
  created_at: string
  enrolled_games?: Array<{ id: number; name: string }>
  parent_email?: string
}

export interface GetAllStudentsResponse {
  success: boolean
  students: Student[]
  count: number
}

export interface AdminStats {
  total_teachers: number
  verified_teachers: number
  pending_teachers: number
  total_students: number
  total_admins: number
}

export interface GetAdminStatsResponse {
  success: boolean
  stats: AdminStats
}

export interface Game {
  id: number
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  created_at: string
  total_courses: number
  total_students: number
}

export interface CreateStudentDto {
  name: string
  email: string
  pin_code?: string
  teacher_id?: number
}

export interface CreateStudentResponse {
  success: boolean
  student: {
    id: number
    name: string
    email: string
    pin: string
    classCode: string
    createdAt: string
  }
}

class AdminAPI {
  /**
   * Create a new student
   */
  async createStudent(data: CreateStudentDto): Promise<CreateStudentResponse> {
    const response = await apiClient.post<CreateStudentResponse>('/admin/students', data)
    return response.data
  }

  /**
   * Get all students
   */
  async getAllStudents(): Promise<GetAllStudentsResponse> {
    const response = await apiClient.get<GetAllStudentsResponse>('/admin/students')
    return response.data
  }

  /**
   * Get student by ID with full details
   */
  async getStudent(id: number): Promise<GetStudentResponse> {
    const response = await apiClient.get<GetStudentResponse>(`/admin/students/${id}`)
    return response.data
  }

  /**
   * Update student information
   */
  async updateStudent(id: number, data: UpdateStudentDto): Promise<UpdateStudentResponse> {
    const response = await apiClient.put<UpdateStudentResponse>(`/admin/students/${id}`, data)
    return response.data
  }

  /**
   * Generate new PIN for student
   */
  async generateNewPin(id: number): Promise<GeneratePinResponse> {
    const response = await apiClient.post<GeneratePinResponse>(`/admin/students/${id}/generate-pin`)
    return response.data
  }

  /**
   * Reset student progress
   */
  async resetStudentProgress(id: number): Promise<ResetProgressResponse> {
    const response = await apiClient.post<ResetProgressResponse>(`/admin/students/${id}/reset-progress`)
    return response.data
  }

  /**
   * Delete student
   */
  async deleteStudent(id: number): Promise<DeleteStudentResponse> {
    const response = await apiClient.delete<DeleteStudentResponse>(`/admin/students/${id}`)
    return response.data
  }

  /**
   * Get all teachers
   */
  async getAllTeachers(): Promise<GetAllTeachersResponse> {
    const response = await apiClient.get<GetAllTeachersResponse>('/admin/teachers')
    return response.data
  }

  /**
   * Create a new teacher
   */
  async createTeacher(data: CreateTeacherDto): Promise<CreateTeacherResponse> {
    const response = await apiClient.post<CreateTeacherResponse>('/admin/teachers', data)
    return response.data
  }

  /**
   * Delete a teacher
   */
  async deleteTeacher(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/admin/teachers/${id}`)
    return response.data
  }

  /**
   * Get admin statistics
   */
  async getAdminStats(): Promise<GetAdminStatsResponse> {
    const response = await apiClient.get<GetAdminStatsResponse>('/admin/stats')
    return response.data
  }

  /**
   * Get all games
   */
  async getAllGames(): Promise<Game[]> {
    const response = await apiClient.get<Game[]>('/admin/games')
    return response.data
  }
}

export default new AdminAPI()
