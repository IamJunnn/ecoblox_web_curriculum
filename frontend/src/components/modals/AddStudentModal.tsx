'use client'

import { useState, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/theme'
import adminAPI, { Teacher, Game } from '@/lib/api/admin.api'
import { createStudent } from '@/lib/api/teacher.api'

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  role: 'admin' | 'teacher'
}

export default function AddStudentModal({ isOpen, onClose, onSuccess, role }: AddStudentModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pin_code: '',
    teacher_id: '',
    parent_email: '',
    game_id: '',
  })

  // Admin-specific data
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [games, setGames] = useState<Game[]>([])

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, role])

  const loadData = async () => {
    try {
      // Load games for both admin and teacher
      const gamesResponse = await adminAPI.getAllGames()
      setGames(gamesResponse.games || [])

      // Only load teachers for admin
      if (role === 'admin') {
        const teachersResponse = await adminAPI.getAllTeachers()
        setTeachers(teachersResponse.teachers || [])
      }
    } catch (error) {
      console.error('Error loading modal data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() || !formData.game_id) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      if (role === 'teacher') {
        // Teacher API call
        const result = await createStudent({
          name: formData.name,
          email: formData.email,
          pin_code: formData.pin_code || undefined,
        })

        alert(
          `Student created successfully!\n\nPIN: ${result.pin_code}\nClass Code: ${result.class_code}\n\nPlease share these with the student.`
        )
      } else {
        // Admin API call
        const studentData: any = {
          name: formData.name,
          email: formData.email,
        }

        if (formData.pin_code) studentData.pin_code = formData.pin_code
        if (formData.teacher_id) studentData.teacher_id = parseInt(formData.teacher_id)
        if (formData.parent_email) studentData.parent_email = formData.parent_email
        if (formData.game_id) studentData.game_id = parseInt(formData.game_id)

        await adminAPI.createStudent(studentData)
        alert('Student created successfully!')
      }

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        pin_code: '',
        teacher_id: '',
        parent_email: '',
        game_id: '',
      })
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error creating student:', error)
      alert(error.response?.data?.message || 'Failed to create student')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePinCodeChange = (value: string) => {
    // Only allow numeric input and max 4 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 4)
    setFormData({ ...formData, pin_code: numericValue })
  }

  if (!isOpen) return null

  const themeColor = role === 'teacher' ? ROLE_COLORS.teacher.primary : ROLE_COLORS.student.primary
  const headerBg = role === 'teacher' ? 'bg-blue-50' : 'bg-yellow-50'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className={`${headerBg} px-6 py-4 rounded-t-lg flex items-center justify-between border-b border-gray-200`}>
          <div className="flex items-center gap-3">
            {role === 'teacher' && <Send className="w-5 h-5" style={{ color: themeColor }} />}
            <h2 className="text-lg font-semibold text-gray-800">Add New Student</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Student Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition text-gray-900"
              onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 3px ${themeColor}40`}
              onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
              required
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@school.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition text-gray-900"
              onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 3px ${themeColor}40`}
              onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
              required
            />
          </div>

          {/* PIN Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN Code (Optional)
            </label>
            <input
              type="text"
              value={formData.pin_code}
              onChange={(e) => handlePinCodeChange(e.target.value)}
              placeholder="Leave empty to auto-generate"
              maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition text-gray-900"
              onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 3px ${themeColor}40`}
              onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
            />
            <p className="text-xs text-gray-500 mt-1">
              If empty, a 4-digit PIN will be generated automatically
            </p>
          </div>

          {/* Parent's Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent's Email (Optional)
            </label>
            <input
              type="email"
              value={formData.parent_email}
              onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
              placeholder="parent@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition text-gray-900"
              onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 3px ${themeColor}40`}
              onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
            />
            <p className="text-xs text-gray-500 mt-1">
              Parent will receive progress notifications
            </p>
          </div>

          {/* Assign to Teacher - Only show for admin */}
          {role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Teacher (Optional)
              </label>
              <select
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition bg-white text-gray-800"
                onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 3px ${themeColor}40`}
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <option value="">Select a teacher</option>
                {teachers && teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Assign student to a specific teacher's class
              </p>
            </div>
          )}

          {/* Enroll in Game/Course */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enroll in Class/Game <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.game_id}
              onChange={(e) => setFormData({ ...formData, game_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition bg-white text-gray-800"
              onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 3px ${themeColor}40`}
              onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
              required
            >
              <option value="">Select a game/course</option>
              {games && games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Enroll student in a game immediately
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: themeColor }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Add Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
