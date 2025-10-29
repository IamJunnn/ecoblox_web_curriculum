'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Plus, Search, Mail, X, Send, Users, CheckCircle, Clock } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'
import adminAPI, { type Teacher, type CreateTeacherDto } from '@/lib/api/admin.api'

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState<CreateTeacherDto>({
    name: '',
    email: '',
    class_code: '',
  })

  // Fetch teachers on mount
  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAllTeachers()
      setTeachers(response.teachers)
    } catch (error) {
      console.error('Error fetching teachers:', error)
      alert('Failed to load teachers')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTeacher = () => {
    setFormData({ name: '', email: '', class_code: '' })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      const response = await adminAPI.createTeacher(formData)

      alert(`Teacher created successfully!\n\nInvitation link: ${response.invitation_link}\n\nAn email has been sent to ${formData.email}`)

      setShowModal(false)
      setFormData({ name: '', email: '', class_code: '' })

      // Refresh teachers list
      fetchTeachers()
    } catch (error: any) {
      console.error('Error creating teacher:', error)
      const errorMessage = error.response?.data?.message || 'Failed to create teacher'
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTeacher = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete teacher "${name}"?\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      await adminAPI.deleteTeacher(id)
      alert('Teacher deleted successfully')
      // Refresh teachers list
      fetchTeachers()
    } catch (error: any) {
      console.error('Error deleting teacher:', error)
      const errorMessage = error.response?.data?.message || 'Failed to delete teacher'
      alert(errorMessage)
    }
  }

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statsData = {
    total: teachers.length,
    verified: teachers.filter(t => t.is_verified).length,
    pending: teachers.filter(t => !t.is_verified).length,
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8" color={ROLE_COLORS.teacher.primary} />
          <h1 className="text-3xl font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
            Manage Teachers
          </h1>
        </div>
        <button
          onClick={handleAddTeacher}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-colors"
          style={{ backgroundColor: ROLE_COLORS.teacher.primary }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = ROLE_COLORS.teacher.dark)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ROLE_COLORS.teacher.primary)}
        >
          <Plus className="w-5 h-5" />
          Add Teacher
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Teachers</span>
            <Users className="w-6 h-6" color={ROLE_COLORS.teacher.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
            {statsData.total}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Verified Teachers</span>
            <CheckCircle className="w-6 h-6" color={ROLE_COLORS.teacher.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
            {statsData.verified}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Pending</span>
            <Clock className="w-6 h-6" color={ROLE_COLORS.teacher.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
            {statsData.pending}
          </p>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">All Teachers</h2>
          </div>

          {/* Search */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.teacher.primary}`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {teacher.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
                        {teacher.class_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold" style={{ color: ROLE_COLORS.teacher.primary }}>
                        {teacher.student_count} {teacher.student_count === 1 ? 'student' : 'students'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 py-1 text-xs rounded font-semibold"
                        style={{
                          backgroundColor: teacher.is_verified
                            ? ROLE_COLORS.teacher.light
                            : '#FEF3C7',
                          color: teacher.is_verified ? ROLE_COLORS.teacher.dark : '#92400E',
                        }}
                      >
                        {teacher.is_verified ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(teacher.last_active).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(teacher.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/teachers/${teacher.id}`}
                        className="text-sm font-medium mr-3 transition-colors"
                        style={{ color: ROLE_COLORS.teacher.primary }}
                        onMouseOver={(e) => (e.currentTarget.style.color = ROLE_COLORS.teacher.dark)}
                        onMouseOut={(e) => (e.currentTarget.style.color = ROLE_COLORS.teacher.primary)}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div
              className="px-6 py-4 border-b"
              style={{ backgroundColor: ROLE_COLORS.teacher.light }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Send className="w-6 h-6" color={ROLE_COLORS.teacher.primary} />
                  <h3 className="text-xl font-bold" style={{ color: ROLE_COLORS.teacher.dark }}>
                    Add New Teacher
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={submitting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.teacher.primary}`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.teacher.primary}`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="teacher@school.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  An invitation email will be sent to this address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.class_code}
                  onChange={(e) => setFormData({ ...formData, class_code: e.target.value })}
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none font-mono"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.teacher.primary}`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="Leave empty to auto-generate"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If empty, a unique class code will be generated
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: ROLE_COLORS.teacher.primary }}
                  onMouseOver={(e) => !submitting && (e.currentTarget.style.backgroundColor = ROLE_COLORS.teacher.dark)}
                  onMouseOut={(e) => !submitting && (e.currentTarget.style.backgroundColor = ROLE_COLORS.teacher.primary)}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
