'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Plus, Search, Loader2, Users, TrendingUp, Zap, Activity, X, Edit } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'
import useAuthStore from '@/store/authStore'
import adminAPI, { Student, Teacher, Game } from '@/lib/api/admin.api'

function formatLastActive(lastActive: string | null): string {
  if (!lastActive) return 'Never'

  const lastActiveDate = new Date(lastActive)
  const now = new Date()
  const diffMs = now.getTime() - lastActiveDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Now'
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
}

export default function ManageStudents() {
  const router = useRouter()
  const { user, isAuthenticated, checkAuth } = useAuthStore()
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [addStudentForm, setAddStudentForm] = useState({
    name: '',
    email: '',
    pin_code: '',
    teacher_id: '',
    parent_email: '',
    game_id: '',
  })
  const [editStudentForm, setEditStudentForm] = useState({
    name: '',
    email: '',
    pin_code: '',
    teacher_id: '',
    game_id: '',
    parent_email: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      console.warn('User is not authenticated. Redirecting to home page.')
      router.push('/')
      return
    }

    if (user?.role !== 'admin') {
      console.warn('User is not an admin. Redirecting to home page.')
      alert('Access denied. Admin privileges required.')
      router.push('/')
      return
    }
  }, [isAuthenticated, user, router])

  // Load data only if authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadStudents()
      loadTeachers()
      loadGames()
    }
  }, [isAuthenticated, user])

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminAPI.getAllStudents()
      setStudents(response.students)
    } catch (err: any) {
      console.error('Error loading students:', err)
      setError(err.response?.data?.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const loadTeachers = async () => {
    try {
      const response = await adminAPI.getAllTeachers()
      setTeachers(response.teachers)
    } catch (err: any) {
      console.error('Error loading teachers:', err)
    }
  }

  const loadGames = async () => {
    try {
      const gamesData = await adminAPI.getAllGames()
      setGames(gamesData)
    } catch (err: any) {
      console.error('Error loading games:', err)
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const data: any = {
        name: addStudentForm.name,
        email: addStudentForm.email,
      }

      // Only add PIN if provided
      if (addStudentForm.pin_code.trim()) {
        data.pin_code = addStudentForm.pin_code.trim()
      }

      // Only add teacher if selected
      if (addStudentForm.teacher_id) {
        data.teacher_id = parseInt(addStudentForm.teacher_id)
      }

      // Only add parent email if provided
      if (addStudentForm.parent_email.trim()) {
        data.parent_email = addStudentForm.parent_email.trim()
      }

      // Only add game if selected
      if (addStudentForm.game_id) {
        data.game_id = parseInt(addStudentForm.game_id)
      }

      await adminAPI.createStudent(data)

      // Reset form and close modal
      setAddStudentForm({ name: '', email: '', pin_code: '', teacher_id: '', parent_email: '', game_id: '' })
      setShowAddModal(false)

      // Reload students
      await loadStudents()
    } catch (err: any) {
      console.error('Error creating student:', err)
      alert(err.response?.data?.message || 'Failed to create student')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setEditStudentForm({
      name: student.name,
      email: student.email,
      pin_code: student.pin_code,
      teacher_id: student.created_by_teacher_id?.toString() || '',
      game_id: student.enrolled_games && student.enrolled_games.length > 0 ? student.enrolled_games[0].id.toString() : '',
      parent_email: student.parent_email || '',
    })
    setShowEditModal(true)
  }

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return
    setSubmitting(true)

    try {
      const data: any = {
        name: editStudentForm.name,
        email: editStudentForm.email,
        pin_code: editStudentForm.pin_code.trim() || undefined,
        parent_email: editStudentForm.parent_email.trim() || undefined,
      }

      // Only add teacher if changed
      if (editStudentForm.teacher_id) {
        data.teacher_id = parseInt(editStudentForm.teacher_id)
      }

      // Only add game if selected
      if (editStudentForm.game_id) {
        data.game_id = parseInt(editStudentForm.game_id)
      }

      await adminAPI.updateStudent(editingStudent.id, data)

      // Reset form and close modal
      setEditStudentForm({ name: '', email: '', pin_code: '', teacher_id: '', game_id: '', parent_email: '' })
      setShowEditModal(false)
      setEditingStudent(null)

      // Reload students
      await loadStudents()
    } catch (err: any) {
      console.error('Error updating student:', err)
      alert(err.response?.data?.message || 'Failed to update student')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteStudent = async (student: Student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?\n\nThis will permanently delete:\n- Student account\n- All progress data\n- All earned badges\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    try {
      await adminAPI.deleteStudent(student.id)
      // Reload students after deletion
      await loadStudents()
    } catch (err: any) {
      console.error('Error deleting student:', err)
      alert(err.response?.data?.message || 'Failed to delete student')
    }
  }

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate stats
  const totalStudents = students.length
  const activeToday = students.filter((s) => {
    if (!s.last_active) return false
    const lastActive = new Date(s.last_active)
    const today = new Date()
    return lastActive.toDateString() === today.toDateString()
  }).length
  const avgProgress = totalStudents > 0
    ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / totalStudents)
    : 0
  const totalXP = students.reduce((sum, s) => sum + (s.totalXP || 0), 0)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <GraduationCap className="w-8 h-8" color={ROLE_COLORS.student.primary} />
          <h1 className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>Manage Students</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" color={ROLE_COLORS.student.primary} />
          <span className="ml-3 text-lg text-gray-600">Loading students...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <GraduationCap className="w-8 h-8" color={ROLE_COLORS.student.primary} />
          <h1 className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>Manage Students</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">Error: {error}</p>
          <button
            onClick={loadStudents}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8" color={ROLE_COLORS.student.primary} />
          <h1 className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>
            Manage Students
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-colors"
          style={{ backgroundColor: ROLE_COLORS.student.primary }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = ROLE_COLORS.student.dark)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ROLE_COLORS.student.primary)}
        >
          <Plus className="w-5 h-5" />
          Add Student
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Students</span>
            <Users className="w-6 h-6" color={ROLE_COLORS.student.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>
            {totalStudents}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Active Today</span>
            <Activity className="w-6 h-6" color={ROLE_COLORS.student.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>{activeToday}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Avg Progress</span>
            <TrendingUp className="w-6 h-6" color={ROLE_COLORS.student.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>{avgProgress}%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total XP</span>
            <Zap className="w-6 h-6" color={ROLE_COLORS.student.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>{totalXP.toLocaleString()}</p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">All Students</h2>
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
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PIN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Game
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total XP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-bold" style={{ color: ROLE_COLORS.student.primary }}>
                        {student.pin_code || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{student.teacher_name || 'No Teacher'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.enrolled_games && student.enrolled_games.length > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {student.enrolled_games[0].name}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Not enrolled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${student.progress}%`,
                              background: `linear-gradient(to right, ${ROLE_COLORS.student.primary}, ${ROLE_COLORS.student.dark})`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold" style={{ color: ROLE_COLORS.student.primary }}>
                        {(student.totalXP || 0).toLocaleString()} XP
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatLastActive(student.last_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-sm font-medium mr-3 transition-colors"
                        style={{ color: ROLE_COLORS.student.primary }}
                        onMouseOver={(e) => (e.currentTarget.style.color = ROLE_COLORS.student.dark)}
                        onMouseOut={(e) => (e.currentTarget.style.color = ROLE_COLORS.student.primary)}
                      >
                        Edit
                      </button>
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="text-sm font-medium mr-3 transition-colors"
                        style={{ color: ROLE_COLORS.student.primary }}
                        onMouseOver={(e) => (e.currentTarget.style.color = ROLE_COLORS.student.dark)}
                        onMouseOut={(e) => (e.currentTarget.style.color = ROLE_COLORS.student.primary)}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteStudent(student)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: ROLE_COLORS.student.light }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold" style={{ color: ROLE_COLORS.student.dark }}>Add New Student</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddStudent} className="px-6 py-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addStudentForm.name}
                    onChange={(e) => setAddStudentForm({ ...addStudentForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-800 bg-white"
                    onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                    placeholder="Enter student name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={addStudentForm.email}
                    onChange={(e) => setAddStudentForm({ ...addStudentForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-800 bg-white"
                    onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                    placeholder="Enter student email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PIN Code (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    pattern="\d{4}"
                    value={addStudentForm.pin_code}
                    onChange={(e) => setAddStudentForm({ ...addStudentForm, pin_code: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-800 bg-white font-mono"
                    onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                    placeholder="Leave empty to auto-generate"
                  />
                  <p className="text-xs text-gray-500 mt-1">4-digit PIN (auto-generated if empty)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent's Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={addStudentForm.parent_email}
                    onChange={(e) => setAddStudentForm({ ...addStudentForm, parent_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-800 bg-white"
                    onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                    placeholder="parent@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Parent will receive progress notifications</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class/Game Selection (Optional)
                  </label>
                  <select
                    value={addStudentForm.game_id}
                    onChange={(e) => setAddStudentForm({ ...addStudentForm, game_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-800 bg-white"
                    onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <option value="">Select a game/course</option>
                    {games.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Which game/course is this student enrolling in?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to Teacher (Optional)
                  </label>
                  <select
                    value={addStudentForm.teacher_id}
                    onChange={(e) => setAddStudentForm({ ...addStudentForm, teacher_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-800 bg-white"
                    onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <option value="">No teacher assigned</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: ROLE_COLORS.student.primary }}
                  onMouseOver={(e) => !submitting && (e.currentTarget.style.backgroundColor = ROLE_COLORS.student.dark)}
                  onMouseOut={(e) => !submitting && (e.currentTarget.style.backgroundColor = ROLE_COLORS.student.primary)}
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: ROLE_COLORS.student.light }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5" color={ROLE_COLORS.student.dark} />
                  <h3 className="text-xl font-bold" style={{ color: ROLE_COLORS.student.dark }}>Edit Student</h3>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingStudent(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateStudent} className="px-6 py-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.name}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-800 bg-white"
                    onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editStudentForm.email}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-800 bg-white"
                    onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    pattern="\d{4}"
                    value={editStudentForm.pin_code}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, pin_code: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-800 bg-white font-mono text-center text-xl"
                    onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                    placeholder="0000"
                  />
                  <p className="text-xs text-gray-500 mt-1">4-digit PIN code for student login</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Teacher
                  </label>
                  <select
                    value={editStudentForm.teacher_id}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, teacher_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-800 bg-white"
                    onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <option value="">Select which teacher this student belongs to</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select which teacher this student belongs to</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class/Game Selection
                  </label>
                  <select
                    value={editStudentForm.game_id}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, game_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-800 bg-white"
                    onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <option value="">Select a game/course</option>
                    {games.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Which game/course is this student currently working on?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent's Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={editStudentForm.parent_email}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, parent_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-800 bg-white"
                    onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                    placeholder="parent@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Parent will receive progress notifications</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingStudent(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: ROLE_COLORS.student.primary }}
                  onMouseOver={(e) => !submitting && (e.currentTarget.style.backgroundColor = ROLE_COLORS.student.dark)}
                  onMouseOut={(e) => !submitting && (e.currentTarget.style.backgroundColor = ROLE_COLORS.student.primary)}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
