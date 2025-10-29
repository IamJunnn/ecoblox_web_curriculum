export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  class_code: string
}

export interface Student extends User {
  role: UserRole.STUDENT
  pin_code?: string
  badges?: number
  progress_percentage?: number
  total_xp?: number
  quiz_score?: string
  last_active?: string
}

export interface Teacher extends User {
  role: UserRole.TEACHER
}

export interface Admin extends User {
  role: UserRole.ADMIN
}