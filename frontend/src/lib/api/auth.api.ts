import apiClient from './client'
import { UserRole } from '@/types/user.types'

export interface LoginCredentials {
  email: string
  password: string
  role?: UserRole
}

export interface StudentPinCredentials {
  email: string
  pin: string
}

export interface LoginResponse {
  success: boolean
  access_token: string
  user: {
    id: number
    name: string
    email: string
    role: UserRole
    class_code: string
  }
}

export interface StudentLoginResponse {
  success: boolean
  access_token: string
  session: {
    id: number
    name: string
    email: string
    role: UserRole
    class_code: string
  }
}

class AuthAPI {
  // Teacher/Admin login with password
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials)
    return response.data
  }

  // Student login with PIN
  async studentLogin(credentials: StudentPinCredentials): Promise<StudentLoginResponse> {
    const response = await apiClient.post<StudentLoginResponse>('/api/auth/student-login', credentials)
    return response.data
  }

  // Logout
  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  }
}

export default new AuthAPI()