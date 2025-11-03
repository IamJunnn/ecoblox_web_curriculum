'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Activity, BarChart3, Star, Award, Plus, Search } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'
import { getTeacherStudents, getTeacherStats, type Student, type TeacherStats } from '@/lib/api/teacher.api'
import AddStudentModal from '@/components/modals/AddStudentModal'

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

export default function TeacherDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    activeToday: 0,
    avgProgress: 0,
    totalXP: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProgress, setFilterProgress] = useState('all')
  const [showModal, setShowModal] = useState(false)

  // Fetch students and stats on mount
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [studentsData, statsData] = await Promise.all([
        getTeacherStudents(),
        getTeacherStats(),
      ])
      setStudents(studentsData.students)
      setStats(statsData.stats)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = () => {
    setShowModal(true)
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterProgress === 'all' ||
      (filterProgress === 'low' && student.progress < 30) ||
      (filterProgress === 'medium' && student.progress >= 30 && student.progress < 70) ||
      (filterProgress === 'high' && student.progress >= 70)

    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8" style={{ color: ROLE_COLORS.teacher.primary }}>
        Teacher Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Students</span>
            <Users className="w-6 h-6" color={ROLE_COLORS.teacher.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
            {loading ? '...' : stats.totalStudents}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Active Today</span>
            <Activity className="w-6 h-6" color={ROLE_COLORS.teacher.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
            {loading ? '...' : stats.activeToday}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Avg Progress</span>
            <BarChart3 className="w-6 h-6" color={ROLE_COLORS.teacher.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
            {loading ? '...' : `${stats.avgProgress}%`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total XP</span>
            <Star className="w-6 h-6" color={ROLE_COLORS.teacher.primary} />
          </div>
          <p className="text-3xl font-bold" style={{ color: ROLE_COLORS.teacher.primary }}>
            {loading ? '...' : stats.totalXP}
          </p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Student List</h2>
            <button
              onClick={handleAddStudent}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-colors"
              style={{ backgroundColor: ROLE_COLORS.teacher.primary }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = ROLE_COLORS.teacher.dark)}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ROLE_COLORS.teacher.primary)}
            >
              <Plus className="w-5 h-5" />
              Add Student
            </button>
          </div>

          {/* Filters */}
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
            <select
              value={filterProgress}
              onChange={(e) => setFilterProgress(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none"
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${ROLE_COLORS.teacher.primary}`
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <option value="all">All Progress</option>
              <option value="low">Low (0-29%)</option>
              <option value="medium">Medium (30-69%)</option>
              <option value="high">High (70-100%)</option>
            </select>
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
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Badges
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
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-2 py-1 text-xs rounded font-medium"
                      style={{
                        backgroundColor: ROLE_COLORS.teacher.light,
                        color: ROLE_COLORS.teacher.dark
                      }}
                    >
                      {student.classCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 mt-1">
                      {student.progress}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold" style={{ color: ROLE_COLORS.teacher.primary }}>
                      {student.totalXP}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Award className="w-4 h-4" color={ROLE_COLORS.teacher.primary} />
                      <span className="text-sm font-medium text-gray-900">{student.badges}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(student.lastActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/teacher/students/${student.id}`}
                      className="text-sm font-medium transition-colors"
                      style={{ color: ROLE_COLORS.teacher.primary }}
                      onMouseOver={(e) => (e.currentTarget.style.color = ROLE_COLORS.teacher.dark)}
                      onMouseOut={(e) => (e.currentTarget.style.color = ROLE_COLORS.teacher.primary)}
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchDashboardData}
        role="teacher"
      />
    </div>
  )
}