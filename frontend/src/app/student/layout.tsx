'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import useAuthStore from '@/store/authStore'
import { GraduationCap, User, MessageCircle, Menu, X } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6" color={ROLE_COLORS.student.primary} />
              <span className="font-bold text-lg" style={{ color: ROLE_COLORS.student.primary }}>Student Portal</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <Link
                href="/student/dashboard"
                className="text-gray-600 transition-colors"
                onMouseOver={(e) => e.currentTarget.style.color = ROLE_COLORS.student.primary}
                onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
              >
                Dashboard
              </Link>
              <Link
                href="/student/progress"
                className="text-gray-600 transition-colors"
                onMouseOver={(e) => e.currentTarget.style.color = ROLE_COLORS.student.primary}
                onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
              >
                My Progress
              </Link>
              <Link
                href="/student/leaderboard"
                className="text-gray-600 transition-colors"
                onMouseOver={(e) => e.currentTarget.style.color = ROLE_COLORS.student.primary}
                onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
              >
                Leaderboard
              </Link>
              <Link
                href="/student/chat"
                className="text-gray-600 transition-colors flex items-center gap-2"
                onMouseOver={(e) => e.currentTarget.style.color = ROLE_COLORS.student.primary}
                onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </Link>
            </div>

            {/* Desktop User Info & Logout */}
            <div className="hidden lg:flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: ROLE_COLORS.student.primary }}>
                  <User className="w-4 h-4" color="white" />
                  <span className="text-sm font-medium text-white">{user.name}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
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
                  href="/student/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/student/progress"
                  className="text-gray-600 hover:text-gray-900 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Progress
                </Link>
                <Link
                  href="/student/leaderboard"
                  className="text-gray-600 hover:text-gray-900 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leaderboard
                </Link>
                <Link
                  href="/student/chat"
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-2 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </Link>

                {/* Mobile User Info */}
                {user && (
                  <div className="flex items-center gap-2 px-2 py-1 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: ROLE_COLORS.student.primary }}>
                      <User className="w-4 h-4" color="white" />
                      <span className="text-sm font-medium text-white">{user.name}</span>
                    </div>
                  </div>
                )}

                {/* Mobile Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors w-full justify-center"
                >
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