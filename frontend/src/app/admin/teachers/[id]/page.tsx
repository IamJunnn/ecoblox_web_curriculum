'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BookOpen, Mail, Users, ArrowLeft, Trash2 } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'
import adminAPI from '@/lib/api/admin.api'

interface TeacherDetail {
  id: number
  name: string
  email: string
  class_codes: Array<{ code: string; game: { name: string } }>
  students: Array<{ id: number; name: string; email: string }>
  created_at: string
  last_active: string
}

export default function TeacherDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teacherId = params.id as string

  const [teacher, setTeacher] = useState<TeacherDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true)
        // For now, we'll call the teacher endpoint from the backend
        const response = await fetch(`http://localhost:3400/admin/teachers/${teacherId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to load teacher data')
        }

        const data = await response.json()
        setTeacher(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching teacher data:', err)
        setError('Failed to load teacher data')
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherData()
  }, [teacherId])

  const handleDeleteTeacher = async () => {
    if (!teacher) return

    if (!confirm(`Delete teacher ${teacher.name}? This action cannot be undone.`)) {
      return
    }

    try {
      await adminAPI.deleteTeacher(teacher.id)
      alert('Teacher deleted successfully')
      router.push('/admin/dashboard')
    } catch (err: any) {
      console.error('Error deleting teacher:', err)
      alert(err.response?.data?.message || 'Failed to delete teacher')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teacher data...</p>
        </div>
      </div>
    )
  }

  if (error || !teacher) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Teacher not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: ROLE_COLORS.teacher.light }}
            >
              <BookOpen className="w-8 h-8" color={ROLE_COLORS.teacher.primary} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{teacher.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {teacher.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Students ({teacher.students.length})</h2>
            </div>
            <div className="p-6">
              {teacher.students.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No students assigned</p>
              ) : (
                <div className="space-y-3">
                  {teacher.students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                      <div>
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/students/${student.id}`)}
                        className="text-sm font-medium"
                        style={{ color: ROLE_COLORS.teacher.primary }}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Teacher Info */}
        <div className="space-y-6">
          {/* Class Codes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Class Codes</h3>
            {teacher.class_codes.length === 0 ? (
              <p className="text-gray-500 text-sm">No class codes</p>
            ) : (
              <div className="space-y-3">
                {teacher.class_codes.map((cc, idx) => (
                  <div key={idx}>
                    <p className="text-sm text-gray-600">{cc.game.name}</p>
                    <p className="font-mono font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
                      {cc.code}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-sm text-gray-900">
                  {new Date(teacher.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Active</p>
                <p className="text-sm text-gray-900">
                  {new Date(teacher.last_active).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teacher ID</p>
                <p className="text-sm text-gray-900">#{teacher.id}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
            <button
              onClick={handleDeleteTeacher}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Teacher
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
