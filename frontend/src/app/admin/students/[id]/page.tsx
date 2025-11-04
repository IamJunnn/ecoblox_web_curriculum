'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { GraduationCap, Mail, Key, BookOpen, Award, TrendingUp, Clock, ArrowLeft, Edit, X, Save } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'
import Link from 'next/link'
import adminAPI from '@/lib/api/admin.api'

interface StudentDetail {
  id: number
  name: string
  email: string
  pin: string
  classCode: string
  teacherId: number
  teacherName: string
  teacherEmail: string
  progress: number
  totalXP: number
  lastActive: string
  createdAt: string
  coursesCompleted: number
  totalCourses: number
  badgesEarned: number
  currentStreak: number
}

interface CourseProgress {
  id: number
  title: string
  progress: number
  xp: number
  completed: boolean
  lastAccessed: string
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [courses, setCourses] = useState<CourseProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    pin: '',
    teacherId: 0,
  })
  const [teachers, setTeachers] = useState<Array<{ id: number; name: string; email: string }>>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)
  const [resetConfirmModal, setResetConfirmModal] = useState(false)

  // Fetch student data on mount
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true)
        const response = await adminAPI.getStudent(parseInt(studentId))

        const studentData: StudentDetail = {
          id: response.student.id,
          name: response.student.name,
          email: response.student.email,
          pin: response.student.pin,
          classCode: response.student.classCode,
          teacherId: response.student.teacher?.id || 0,
          teacherName: response.student.teacher?.name || 'N/A',
          teacherEmail: response.student.teacher?.email || 'N/A',
          progress: response.student.progress,
          totalXP: response.student.totalXP,
          lastActive: formatRelativeTime(response.student.lastActive),
          createdAt: formatDate(response.student.createdAt),
          coursesCompleted: response.student.coursesCompleted,
          totalCourses: response.student.totalCourses,
          badgesEarned: response.student.badgesEarned,
          currentStreak: 0, // TODO: Calculate from progress data
        }

        setStudent(studentData)

        // Transform course progress data
        const coursesData = response.courseProgress.map(cp => ({
          id: cp.courseId,
          title: cp.courseName,
          progress: cp.progress || 0, // Use actual progress from backend
          xp: cp.xp,
          completed: cp.completed,
          lastAccessed: formatRelativeTime(cp.lastAccessed),
        }))

        setCourses(coursesData)
        setError(null)
      } catch (err) {
        console.error('Error fetching student data:', err)
        setError('Failed to load student data')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [studentId])

  // Format date helper
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  // Format relative time helper
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
    return formatDate(dateStr)
  }

  const handleEditClick = async () => {
    if (!student) return
    setEditForm({
      name: student.name,
      email: student.email,
      pin: student.pin,
      teacherId: student.teacherId || 0,
    })

    // Fetch teachers when opening edit modal
    setLoadingTeachers(true)
    try {
      const response = await adminAPI.getAllTeachers()
      setTeachers(response.teachers)
    } catch (err) {
      console.error('Error fetching teachers:', err)
    } finally {
      setLoadingTeachers(false)
    }

    setEditModal(true)
  }

  const handleEditSave = async () => {
    if (!student) return

    try {
      const updateData: any = {
        name: editForm.name,
        email: editForm.email,
        pin_code: editForm.pin,
      }

      // Only include teacher_id if it's been changed
      if (editForm.teacherId !== student.teacherId) {
        updateData.teacher_id = editForm.teacherId === 0 ? null : editForm.teacherId
      }

      const response = await adminAPI.updateStudent(student.id, updateData)

      // Refresh the page to get updated teacher info
      window.location.reload()
    } catch (err) {
      console.error('Error updating student:', err)
      alert('Failed to update student')
    }
  }

  const handleEditCancel = () => {
    setEditModal(false)
  }

  const handleGeneratePin = async () => {
    if (!student) return

    if (!confirm('Generate a new PIN for this student? The old PIN will no longer work.')) {
      return
    }

    try {
      const response = await adminAPI.generateNewPin(student.id)
      setStudent({
        ...student,
        pin: response.pin,
      })
      alert(`New PIN generated: ${response.pin}`)
    } catch (err) {
      console.error('Error generating PIN:', err)
      alert('Failed to generate new PIN')
    }
  }

  const handleResetProgress = async () => {
    if (!student) return
    setResetConfirmModal(true)
  }

  const confirmResetProgress = async () => {
    if (!student) return

    try {
      await adminAPI.resetStudentProgress(student.id)
      setResetConfirmModal(false)
      // Refresh student data
      window.location.reload()
    } catch (err) {
      console.error('Error resetting progress:', err)
      alert('Failed to reset progress')
      setResetConfirmModal(false)
    }
  }

  const handleDeleteStudent = async () => {
    if (!student) return

    if (!confirm('Delete this student? This action cannot be undone and will remove all their progress data.')) {
      return
    }

    try {
      await adminAPI.deleteStudent(student.id)
      alert('Student deleted successfully')
      router.push('/admin/manage-students')
    } catch (err) {
      console.error('Error deleting student:', err)
      alert('Failed to delete student')
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !student) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Student not found'}</p>
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
              style={{ backgroundColor: ROLE_COLORS.student.light }}
            >
              <GraduationCap className="w-8 h-8" color={ROLE_COLORS.student.primary} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {student.email}
                </span>
                <span className="flex items-center gap-1">
                  <Key className="w-4 h-4" />
                  PIN: <span className="font-mono font-bold" style={{ color: ROLE_COLORS.student.primary }}>{student.pin}</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Overall Progress</span>
            <TrendingUp className="w-5 h-5" color={ROLE_COLORS.student.primary} />
          </div>
          <p className="text-2xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>
            {student.progress}%
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${student.progress}%`,
                background: `linear-gradient(to right, ${ROLE_COLORS.student.primary}, ${ROLE_COLORS.student.dark})`,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total XP</span>
            <Award className="w-5 h-5" color={ROLE_COLORS.student.primary} />
          </div>
          <p className="text-2xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>
            {student.totalXP}
          </p>
          <p className="text-xs text-gray-500 mt-1">Rank: Apprentice</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Courses</span>
            <BookOpen className="w-5 h-5" color={ROLE_COLORS.student.primary} />
          </div>
          <p className="text-2xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>
            {student.coursesCompleted}/{student.totalCourses}
          </p>
          <p className="text-xs text-gray-500 mt-1">Completed</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Current Streak</span>
            <Clock className="w-5 h-5" color={ROLE_COLORS.student.primary} />
          </div>
          <p className="text-2xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>
            {student.currentStreak} days
          </p>
          <p className="text-xs text-gray-500 mt-1">{student.badgesEarned} badges earned</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Progress */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Course Progress</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" color={ROLE_COLORS.student.primary} />
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      </div>
                      {course.completed && (
                        <span
                          className="px-2 py-1 text-xs rounded font-semibold"
                          style={{
                            backgroundColor: ROLE_COLORS.student.light,
                            color: ROLE_COLORS.student.dark,
                          }}
                        >
                          COMPLETED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${course.progress}%`,
                              background: `linear-gradient(to right, ${ROLE_COLORS.student.primary}, ${ROLE_COLORS.student.dark})`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: ROLE_COLORS.student.primary }}>
                        {course.progress}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{course.xp} XP earned</span>
                      <span>Last accessed: {course.lastAccessed}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="space-y-6">
          {/* Teacher Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Teacher</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{student.teacherName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm text-gray-900">{student.teacherEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Class Code</p>
                <p className="font-mono font-bold" style={{ color: ROLE_COLORS.student.primary }}>
                  {student.classCode}
                </p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-sm text-gray-900">{student.createdAt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Active</p>
                <p className="text-sm text-gray-900">{student.lastActive}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="text-sm text-gray-900">#{student.id}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleResetProgress}
                className="w-full px-4 py-2 text-white rounded-lg font-medium transition-colors"
                style={{ backgroundColor: ROLE_COLORS.student.primary }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = ROLE_COLORS.student.dark)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ROLE_COLORS.student.primary)}
              >
                Reset Progress
              </button>
              <button
                onClick={handleGeneratePin}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Generate New PIN
              </button>
              <button
                onClick={handleDeleteStudent}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div
              className="px-6 py-4 border-b"
              style={{ backgroundColor: ROLE_COLORS.student.light }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit className="w-6 h-6" color={ROLE_COLORS.student.primary} />
                  <h3 className="text-xl font-bold" style={{ color: ROLE_COLORS.student.dark }}>
                    Edit Student
                  </h3>
                </div>
                <button
                  onClick={handleEditCancel}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={editForm.pin}
                  onChange={(e) => setEditForm({ ...editForm, pin: e.target.value })}
                  maxLength={4}
                  pattern="[0-9]{4}"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-xl font-mono tracking-wider text-gray-800 bg-white focus:outline-none"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">4-digit PIN code for student login</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Teacher
                </label>
                {loadingTeachers ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-500 bg-gray-50">
                    Loading teachers...
                  </div>
                ) : (
                  <select
                    value={editForm.teacherId}
                    onChange={(e) => setEditForm({ ...editForm, teacherId: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none"
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.student.primary}`
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <option value={0}>No Teacher (Unassigned)</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.email})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">Select which teacher this student belongs to</p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={handleEditCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-colors"
                style={{ backgroundColor: ROLE_COLORS.student.primary }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = ROLE_COLORS.student.dark)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ROLE_COLORS.student.primary)}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Progress Confirmation Modal */}
      {resetConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div
              className="px-6 py-5 border-b"
              style={{ backgroundColor: ROLE_COLORS.student.light }}
            >
              <h3 className="text-2xl font-bold" style={{ color: ROLE_COLORS.student.dark }}>
                Reset Student Progress?
              </h3>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to reset all progress for <span className="font-bold">{student?.name}</span>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-medium mb-2">
                    This will permanently delete:
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 ml-4">
                    <li>• All completed steps and quizzes</li>
                    <li>• All earned badges</li>
                    <li>• All XP progress</li>
                    <li>• All course completion status</li>
                  </ul>
                  <p className="text-sm text-red-800 font-bold mt-3">
                    ⚠️ This action cannot be undone!
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setResetConfirmModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResetProgress}
                  className="flex-1 px-4 py-3 rounded-lg text-white font-bold transition-colors hover:opacity-90"
                  style={{ backgroundColor: ROLE_COLORS.student.primary }}
                >
                  Yes, Reset Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
