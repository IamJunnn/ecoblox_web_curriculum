'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useAuthStore from '@/store/authStore'
import { GraduationCap, User } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6" color={ROLE_COLORS.student.primary} />
                <span className="font-bold text-lg" style={{ color: ROLE_COLORS.student.primary }}>Student Portal</span>
              </div>

              <div className="flex items-center gap-6">
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
              </div>
            </div>

            <div className="flex items-center gap-4">
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}