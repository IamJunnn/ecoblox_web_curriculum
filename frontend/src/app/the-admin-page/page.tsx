'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/store/authStore'
import { UserRole } from '@/types/user.types'
import { Shield, Mail, Lock, Rocket } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'

export default function AdminLoginPage() {
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
      // Longer delay to ensure cookies are fully written
      await new Promise(resolve => setTimeout(resolve, 300))
      // Use window.location for hard redirect
      window.location.href = '/admin/dashboard'
    } catch (error: any) {
      console.error('Admin login error:', error)
      setError(error.response?.data?.message || 'Invalid credentials. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="EcoBlox Logo"
            className="h-16 w-auto mx-auto mb-4"
          />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-7 h-7" style={{ color: ROLE_COLORS.admin.primary }} />
            <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          </div>
          <p className="text-gray-600">Secure administrator access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            {loading ? 'Logging in...' : 'Access Admin Panel'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1"
          >
            <Rocket className="w-4 h-4" />
            Back to Main Login
          </a>
        </div>
      </div>
    </div>
  )
}
