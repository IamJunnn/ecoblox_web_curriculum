'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { GraduationCap, User, LogOut, MessageCircle } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [teacherName, setTeacherName] = useState<string>('')

  useEffect(() => {
    // Get teacher info from localStorage
    const userDataStr = localStorage.getItem('user')
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr)

        // Check if user is actually a teacher
        if (userData.role !== 'teacher') {
          // Redirect non-teachers to their appropriate portal
          if (userData.role === 'admin') {
            router.push('/admin/dashboard')
          } else if (userData.role === 'student') {
            router.push('/student/dashboard')
          } else {
            router.push('/')
          }
          return
        }

        if (userData.name) {
          setTeacherName(userData.name)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/')
      }
    } else {
      // No user data, redirect to login
      router.push('/')
    }
  }, [router])

  const handleLogout = () => {
    // Clear auth tokens and user data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/teacher/dashboard" className="flex items-center gap-2">
                <GraduationCap className="w-7 h-7" color={ROLE_COLORS.teacher.primary} />
                <span className="font-bold text-lg" style={{ color: ROLE_COLORS.teacher.primary }}>
                  Teacher Portal
                </span>
              </Link>

              <div className="flex items-center gap-6">
                <Link
                  href="/teacher/dashboard"
                  className="text-gray-600 transition-colors"
                  onMouseOver={(e) => (e.currentTarget.style.color = ROLE_COLORS.teacher.primary)}
                  onMouseOut={(e) => (e.currentTarget.style.color = '')}
                >
                  Dashboard
                </Link>
                <Link
                  href="/teacher/students"
                  className="text-gray-600 transition-colors"
                  onMouseOver={(e) => (e.currentTarget.style.color = ROLE_COLORS.teacher.primary)}
                  onMouseOut={(e) => (e.currentTarget.style.color = '')}
                >
                  Students
                </Link>
                <Link
                  href="/teacher/manage-students"
                  className="text-gray-600 transition-colors"
                  onMouseOver={(e) => (e.currentTarget.style.color = ROLE_COLORS.teacher.primary)}
                  onMouseOut={(e) => (e.currentTarget.style.color = '')}
                >
                  Manage Students
                </Link>
                <Link
                  href="/teacher/chat"
                  className="text-gray-600 transition-colors flex items-center gap-2"
                  onMouseOver={(e) => (e.currentTarget.style.color = ROLE_COLORS.teacher.primary)}
                  onMouseOut={(e) => (e.currentTarget.style.color = '')}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {teacherName && (
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{teacherName}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}