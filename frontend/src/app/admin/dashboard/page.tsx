'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GraduationCap, BookOpen, Shield, Users, AlertTriangle, X, Loader2 } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'
import adminAPI from '@/lib/api/admin.api'

interface User {
  id: number
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  classCode: string
  lastActive: string
  progress?: number
  totalXP?: number
}

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

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    admins: 0,
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; user: User | null }>({
    show: false,
    user: null,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch students, teachers, and stats
      const [studentsRes, teachersRes, statsRes] = await Promise.all([
        adminAPI.getAllStudents(),
        adminAPI.getAllTeachers(),
        adminAPI.getAdminStats(),
      ])

      // Combine all users
      const allUsers: User[] = [
        ...studentsRes.students.map(student => ({
          id: student.id,
          name: student.name,
          email: student.email,
          role: 'student' as const,
          classCode: student.class_code || 'N/A',
          lastActive: formatLastActive(student.last_active),
          progress: student.progress,
          totalXP: student.totalXP,
        })),
        ...teachersRes.teachers.map(teacher => ({
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          role: 'teacher' as const,
          classCode: teacher.class_codes.length > 0 ? teacher.class_codes[0].code : 'N/A',
          lastActive: formatLastActive(teacher.last_active),
        })),
      ]

      setUsers(allUsers)
      setStats({
        totalUsers: allUsers.length,
        students: statsRes.stats.total_students,
        teachers: statsRes.stats.total_teachers,
        admins: statsRes.stats.total_admins,
      })
    } catch (err: any) {
      console.error('Error loading admin data:', err)
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (user: User) => {
    setDeleteModal({ show: true, user })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return

    try {
      if (deleteModal.user.role === 'student') {
        await adminAPI.deleteStudent(deleteModal.user.id)
      } else if (deleteModal.user.role === 'teacher') {
        await adminAPI.deleteTeacher(deleteModal.user.id)
      }

      // Reload data after deletion
      await loadData()
      setDeleteModal({ show: false, user: null })
    } catch (err: any) {
      console.error('Error deleting user:', err)
      alert(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, user: null })
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterRole === 'all' || user.role === filterRole

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8" color={ROLE_COLORS.admin.primary} />
          <h1 className="text-3xl font-bold" style={{ color: ROLE_COLORS.admin.primary }}>Admin Dashboard</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" color={ROLE_COLORS.admin.primary} />
          <span className="ml-3 text-lg text-gray-600">Loading admin data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8" color={ROLE_COLORS.admin.primary} />
          <h1 className="text-3xl font-bold" style={{ color: ROLE_COLORS.admin.primary }}>Admin Dashboard</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">Error: {error}</p>
          <button
            onClick={loadData}
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
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8" color={ROLE_COLORS.admin.primary} />
        <h1 className="text-3xl font-bold" style={{ color: ROLE_COLORS.admin.primary }}>Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Users</span>
            <Users className="w-8 h-8" color={ROLE_COLORS.admin.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.admin.primary }}>{stats.totalUsers}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Students</span>
            <GraduationCap className="w-8 h-8" color={ROLE_COLORS.student.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.student.primary }}>{stats.students}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Teachers</span>
            <BookOpen className="w-8 h-8" color={ROLE_COLORS.teacher.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>{stats.teachers}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">All Users</h2>
            <div className="flex gap-2">
              <Link
                href="/admin/manage-students"
                className="px-4 py-2 text-white rounded-lg transition-colors"
                style={{
                  backgroundColor: ROLE_COLORS.student.primary,
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = ROLE_COLORS.student.dark}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = ROLE_COLORS.student.primary}
              >
                Manage Students
              </Link>
              <Link
                href="/admin/manage-teachers"
                className="px-4 py-2 text-white rounded-lg transition-colors"
                style={{
                  backgroundColor: ROLE_COLORS.teacher.primary,
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = ROLE_COLORS.teacher.dark}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = ROLE_COLORS.teacher.primary}
              >
                Manage Teachers
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:border-transparent"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.admin.primary}`
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:border-transparent"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.admin.primary}`
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-2 py-1 text-xs rounded font-semibold"
                      style={{
                        backgroundColor: user.role === 'student'
                          ? ROLE_COLORS.student.light
                          : user.role === 'teacher'
                          ? ROLE_COLORS.teacher.light
                          : ROLE_COLORS.admin.light,
                        color: user.role === 'student'
                          ? ROLE_COLORS.student.dark
                          : user.role === 'teacher'
                          ? ROLE_COLORS.teacher.dark
                          : ROLE_COLORS.admin.dark,
                      }}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{user.classCode}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'student' && user.progress !== undefined ? (
                      <div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${user.progress}%`,
                              background: `linear-gradient(to right, ${ROLE_COLORS.student.primary}, ${ROLE_COLORS.student.dark})`
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{user.progress}%</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={
                        user.role === 'student'
                          ? `/admin/students/${user.id}`
                          : user.role === 'teacher'
                          ? `/admin/teachers/${user.id}`
                          : `/admin/dashboard`
                      }
                      className="text-sm font-medium mr-3 transition-colors"
                      style={{
                        color: user.role === 'student'
                          ? ROLE_COLORS.student.primary
                          : user.role === 'teacher'
                          ? ROLE_COLORS.teacher.primary
                          : ROLE_COLORS.admin.primary
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = user.role === 'student'
                          ? ROLE_COLORS.student.dark
                          : user.role === 'teacher'
                          ? ROLE_COLORS.teacher.dark
                          : ROLE_COLORS.admin.dark
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = user.role === 'student'
                          ? ROLE_COLORS.student.primary
                          : user.role === 'teacher'
                          ? ROLE_COLORS.teacher.primary
                          : ROLE_COLORS.admin.primary
                      }}
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-red-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-bold text-red-900">Confirm Delete</h3>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-gray-800 mb-2">
                Do you want to delete <span className="font-bold">{deleteModal.user.name}</span>?
              </p>
              <p className="text-red-600 font-semibold text-sm">
                You cannot restore back.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}