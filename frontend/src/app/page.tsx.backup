'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import useAuthStore from '@/store/authStore'
import { UserRole } from '@/types/user.types'

export default function HomePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'admin'>('student')
  const { user, isAuthenticated, checkAuth } = useAuthStore()

  // TEMPORARILY DISABLED FOR TESTING
  // useEffect(() => {
  //   // Check if user is already authenticated
  //   checkAuth()
  //   if (isAuthenticated && user) {
  //     // Redirect based on role
  //     switch (user.role) {
  //       case UserRole.STUDENT:
  //         router.push('/student/dashboard')
  //         break
  //       case UserRole.TEACHER:
  //         router.push('/teacher/dashboard')
  //         break
  //       case UserRole.ADMIN:
  //         router.push('/admin/dashboard')
  //         break
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isAuthenticated, user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side: Branding */}
            <div className="text-center lg:text-left">
              <div className="mb-8 flex flex-col items-center lg:items-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo.png"
                  alt="EcoBlox Logo"
                  className="h-16 w-auto"
                />
              </div>
              <p className="text-xl text-[#4b5563] mb-8">
                Master game development with interactive, step-by-step tutorials designed for 8th-10th grade students.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⭐</span>
                  <span className="text-[#1f2937]">Earn XP & Unlock Achievements</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <span className="text-[#1f2937]">Game-Style Level Progression</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <span className="text-[#1f2937]">Track Your Progress</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  <span className="text-[#1f2937]">Learn with Your Class</span>
                </div>
              </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-center text-[#1f2937] mb-6">
                🚀 Start Your Journey
              </h3>

              {/* Role Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('student')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    activeTab === 'student'
                      ? 'bg-[#66b850] text-white hover:bg-[#57a040]'
                      : 'bg-gray-100 text-[#4b5563] hover:bg-gray-200'
                  }`}
                >
                  👨‍🎓 Student
                </button>
                <button
                  onClick={() => setActiveTab('teacher')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    activeTab === 'teacher'
                      ? 'bg-[#18613a] text-white hover:bg-[#134d2e]'
                      : 'bg-gray-100 text-[#4b5563] hover:bg-gray-200'
                  }`}
                >
                  👨‍🏫 Teacher
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-[#4b5563] hover:bg-gray-200'
                  }`}
                >
                  ⚙️ Admin
                </button>
              </div>

              {/* Login Forms */}
              <div className="space-y-4">
                {activeTab === 'student' && <StudentLoginForm />}
                {activeTab === 'teacher' && <TeacherLoginForm />}
                {activeTab === 'admin' && <AdminLoginForm />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Student Login Form Component
function StudentLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { studentLogin } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await studentLogin(email, pin)
      router.push('/student/dashboard')
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid email or PIN. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#1f2937] mb-2">
          📧 Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#1f2937] bg-white focus:ring-2 focus:ring-[#66b850] focus:border-transparent"
          placeholder="your.email@school.com"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1f2937] mb-2">
          🔑 PIN Code
        </label>
        <input
          type="text"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-wider text-[#1f2937] bg-white focus:ring-2 focus:ring-[#66b850] focus:border-transparent"
          placeholder="0000"
          maxLength={4}
          pattern="[0-9]{4}"
          disabled={loading}
          required
        />
        <p className="text-sm text-[#4b5563] mt-2">
          💡 Ask your teacher for your PIN code
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-[#66b850] text-white font-bold rounded-lg hover:bg-[#57a040] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging in...' : '🚀 Enter Academy'}
      </button>
    </form>
  )
}

// Teacher Login Form Component
function TeacherLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password, UserRole.TEACHER)
      router.push('/teacher/dashboard')
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid credentials. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#1f2937] mb-2">
          📧 Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#1f2937] bg-white focus:ring-2 focus:ring-[#66b850] focus:border-transparent"
          placeholder="teacher@school.com"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1f2937] mb-2">
          🔒 Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#1f2937] bg-white focus:ring-2 focus:ring-[#66b850] focus:border-transparent"
          placeholder="Enter your password"
          disabled={loading}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-[#18613a] text-white font-bold rounded-lg hover:bg-[#134d2e] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging in...' : '👨‍🏫 Teacher Login'}
      </button>

      <p className="text-center text-sm text-[#4b5563]">
        Default: teacher@robloxacademy.com / teacher123
      </p>
    </form>
  )
}

// Admin Login Form Component
function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password, UserRole.ADMIN)
      router.push('/admin/dashboard')
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid credentials. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#1f2937] mb-2">
          📧 Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#1f2937] bg-white focus:ring-2 focus:ring-[#66b850] focus:border-transparent"
          placeholder="admin@robloxacademy.com"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1f2937] mb-2">
          🔒 Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#1f2937] bg-white focus:ring-2 focus:ring-[#66b850] focus:border-transparent"
          placeholder="Enter your password"
          disabled={loading}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging in...' : '⚙️ Admin Login'}
      </button>

      <p className="text-center text-sm text-[#4b5563]">
        Default: admin@robloxacademy.com / admin123
      </p>
    </form>
  )
}