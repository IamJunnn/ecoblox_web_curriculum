'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { GraduationCap, User, LogOut, MessageCircle, Menu, X } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [teacherName, setTeacherName] = useState<string>('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/teacher/dashboard" className="flex items-center gap-2">
              <GraduationCap className="w-7 h-7" color={ROLE_COLORS.teacher.primary} />
              <span className="font-bold text-lg" style={{ color: ROLE_COLORS.teacher.primary }}>
                Teacher Portal
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
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

            {/* Desktop User Info & Logout */}
            <div className="hidden lg:flex items-center gap-4">
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <Link
                  href="/teacher/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/teacher/students"
                  className="text-gray-600 hover:text-gray-900 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Students
                </Link>
                <Link
                  href="/teacher/manage-students"
                  className="text-gray-600 hover:text-gray-900 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Manage Students
                </Link>
                <Link
                  href="/teacher/chat"
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-2 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </Link>

                {/* Mobile User Info */}
                {teacherName && (
                  <div className="flex items-center gap-2 px-2 py-1 border-t border-gray-200 pt-4">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{teacherName}</span>
                  </div>
                )}

                {/* Mobile Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors w-full justify-center"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}