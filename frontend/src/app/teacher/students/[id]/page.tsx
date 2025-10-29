'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { GraduationCap, Mail, BookOpen, Award, TrendingUp, Clock, ArrowLeft } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'
import Link from 'next/link'
import { getTeacherStudents, type Student } from '@/lib/api/teacher.api'

// Format date to readable format (e.g., "Oct 28, 2025 at 10:34 PM")
function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }
    return date.toLocaleString('en-US', options).replace(',', ' at')
  } catch {
    return dateString
  }
}

export default function TeacherStudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = parseInt(params.id as string)

  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch student data on mount
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true)
        const response = await getTeacherStudents()

        // Find the specific student from the list
        const foundStudent = response.students.find(s => s.id === studentId)

        if (!foundStudent) {
          setError('Student not found')
        } else {
          setStudent(foundStudent)
        }
      } catch (err) {
        console.error('Error fetching student data:', err)
        setError('Failed to load student data')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [studentId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: ROLE_COLORS.teacher.primary }}></div>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-600">{error || 'Student not found'}</p>
          <Link
            href="/teacher/dashboard"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: ROLE_COLORS.teacher.primary }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/teacher/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium mb-4 transition-colors"
          style={{ color: ROLE_COLORS.teacher.primary }}
          onMouseOver={(e) => (e.currentTarget.style.color = ROLE_COLORS.teacher.dark)}
          onMouseOut={(e) => (e.currentTarget.style.color = ROLE_COLORS.teacher.primary)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
          Student Details
        </h1>
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div
          className="px-6 py-4 border-b"
          style={{ backgroundColor: ROLE_COLORS.teacher.light }}
        >
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8" color={ROLE_COLORS.teacher.primary} />
            <div>
              <h2 className="text-2xl font-bold" style={{ color: ROLE_COLORS.teacher.dark }}>
                {student.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {student.email}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Class Code */}
          <div>
            <div className="text-sm text-gray-500 mb-1">Class Code</div>
            <span
              className="inline-block px-3 py-1 text-sm rounded font-medium"
              style={{
                backgroundColor: ROLE_COLORS.teacher.light,
                color: ROLE_COLORS.teacher.dark,
              }}
            >
              {student.classCode}
            </span>
          </div>

          {/* Progress */}
          <div>
            <div className="text-sm text-gray-500 mb-1">Overall Progress</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                  style={{ width: `${student.progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{student.progress}%</span>
            </div>
          </div>

          {/* Last Active */}
          <div>
            <div className="text-sm text-gray-500 mb-1">Last Active</div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" color={ROLE_COLORS.teacher.primary} />
              <span className="text-sm font-medium text-gray-900">{formatDateTime(student.lastActive)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total XP</span>
            <TrendingUp className="w-6 h-6" color={ROLE_COLORS.teacher.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
            {student.totalXP}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Badges Earned</span>
            <Award className="w-6 h-6" color={ROLE_COLORS.teacher.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
            {student.badges}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Progress</span>
            <BookOpen className="w-6 h-6" color={ROLE_COLORS.teacher.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
            {student.progress}%
          </p>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-xl font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
            Activity Summary
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Total Experience Points</span>
              <span className="font-semibold" style={{ color: ROLE_COLORS.teacher.primary }}>
                {student.totalXP} XP
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Badges Earned</span>
              <span className="font-semibold" style={{ color: ROLE_COLORS.teacher.primary }}>
                {student.badges}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Overall Progress</span>
              <span className="font-semibold" style={{ color: ROLE_COLORS.teacher.primary }}>
                {student.progress}%
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Last Activity</span>
              <span className="font-semibold text-gray-700">{formatDateTime(student.lastActive)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
