'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/store/authStore'
import { UserRole } from '@/types/user.types'
import {
  GraduationCap,
  BookOpen,
  Shield,
  Mail,
  Lock,
  KeyRound,
  Star,
  Target,
  TrendingUp,
  Users,
  Rocket,
  Lightbulb
} from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'

export default function HomePage() {
  const router = useRouter()

  // Start with default value to avoid hydration mismatch
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'admin'>('student')

  // Load saved tab from localStorage after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('loginTab')
      if (savedTab === 'teacher' || savedTab === 'admin' || savedTab === 'student') {
        setActiveTab(savedTab)
      }
    }
  }, [])

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('loginTab', activeTab)
    }
  }, [activeTab])

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
              <p className="text-xl text-gray-600 mb-8">
                Master game development with interactive, step-by-step tutorials designed for 8th-10th grade students.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6" color={ROLE_COLORS.student.primary} />
                  <span className="text-gray-800">Earn XP & Unlock Achievements</span>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6" color={ROLE_COLORS.student.primary} />
                  <span className="text-gray-800">Game-Style Level Progression</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6" color={ROLE_COLORS.student.primary} />
                  <span className="text-gray-800">Track Your Progress</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6" color={ROLE_COLORS.student.primary} />
                  <span className="text-gray-800">Learn with Your Class</span>
                </div>
              </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Rocket className="w-7 h-7 text-gray-700" />
                <h3 className="text-2xl font-bold text-gray-800">
                  Start Your Journey
                </h3>
              </div>

              {/* Role Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('student')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'student'
                      ? 'bg-[#6B9E3E] text-white hover:bg-[#5A8533]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('teacher')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'teacher'
                      ? 'bg-[#2D5016] text-white hover:bg-[#1F3810]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'admin'
                      ? 'bg-[#3CBB90] text-white hover:bg-[#2FA077]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Admin
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
      // Clear the saved tab on successful login
      localStorage.removeItem('loginTab')
      // Small delay to ensure cookies are set before redirect
      await new Promise(resolve => setTimeout(resolve, 100))
      // Use window.location for hard redirect to ensure cookies are set
      window.location.href = '/student/dashboard'
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
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Mail className="w-4 h-4" color={ROLE_COLORS.student.primary} />
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B9E3E] focus:border-transparent"
          placeholder="your.email@school.com"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <KeyRound className="w-4 h-4" color={ROLE_COLORS.student.primary} />
          PIN Code
        </label>
        <input
          type="text"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-wider text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B9E3E] focus:border-transparent"
          placeholder="0000"
          maxLength={4}
          pattern="[0-9]{4}"
          disabled={loading}
          required
        />
        <p className="flex items-center gap-1 text-sm text-gray-500 mt-2">
          <Lightbulb className="w-4 h-4" />
          Ask your teacher for your PIN code
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-[#6B9E3E] text-white font-bold rounded-lg hover:bg-[#5A8533] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Rocket className="w-5 h-5" />
        {loading ? 'Logging in...' : 'Enter Academy'}
      </button>

      <p className="text-center text-sm text-gray-500 mt-3">
        Test account: student@test.com / PIN: 1234
      </p>
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
      // Clear the saved tab on successful login
      localStorage.removeItem('loginTab')
      // Small delay to ensure cookies are set before redirect
      await new Promise(resolve => setTimeout(resolve, 100))
      // Use window.location for hard redirect to ensure cookies are set
      window.location.href = '/teacher/dashboard'
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
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Mail className="w-4 h-4" color={ROLE_COLORS.teacher.primary} />
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent"
          placeholder="teacher@school.com"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Lock className="w-4 h-4" color={ROLE_COLORS.teacher.primary} />
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent"
          placeholder="Enter your password"
          disabled={loading}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-[#2D5016] text-white font-bold rounded-lg hover:bg-[#1F3810] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <BookOpen className="w-5 h-5" />
        {loading ? 'Logging in...' : 'Teacher Login'}
      </button>

      <p className="text-center text-sm text-gray-500">
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
      // Clear the saved tab on successful login
      localStorage.removeItem('loginTab')
      // Small delay to ensure cookies are set before redirect
      await new Promise(resolve => setTimeout(resolve, 100))
      // Use window.location for hard redirect
      window.location.href = '/admin/dashboard'
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
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Mail className="w-4 h-4" color={ROLE_COLORS.admin.primary} />
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3CBB90] focus:border-transparent"
          placeholder="admin@ecoblox.build"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Lock className="w-4 h-4" color={ROLE_COLORS.admin.primary} />
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3CBB90] focus:border-transparent"
          placeholder="Enter your password"
          disabled={loading}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-[#3CBB90] text-white font-bold rounded-lg hover:bg-[#2FA077] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Shield className="w-5 h-5" />
        {loading ? 'Logging in...' : 'Admin Login'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Default: admin@ecoblox.build / admin123
      </p>
    </form>
  )
}
