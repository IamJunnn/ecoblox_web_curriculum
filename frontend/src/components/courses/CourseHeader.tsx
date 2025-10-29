'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROLE_COLORS } from '@/lib/theme'

interface CourseHeaderProps {
  title: string
  subtitle: string
  currentXP?: number
  totalXP?: number
  currentLevel?: number
  totalLevels?: number
}

export default function CourseHeader({
  title,
  subtitle,
  currentXP,
  totalXP,
  currentLevel,
  totalLevels
}: CourseHeaderProps) {
  const router = useRouter()

  return (
    <header
      className="text-white px-8 py-8 shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${ROLE_COLORS.student.primary} 0%, ${ROLE_COLORS.student.dark} 100%)`
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-shadow">{title}</h1>
            <p className="text-lg opacity-95">{subtitle}</p>
          </div>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 border-2 border-white rounded-lg transition font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>

        {/* Stats Bar */}
        {(currentXP !== undefined || currentLevel !== undefined) && (
          <div className="flex gap-6 bg-black/20 rounded-lg px-6 py-4">
            {currentXP !== undefined && totalXP !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="text-sm opacity-90">XP</div>
                  <div className="text-xl font-bold">{currentXP} / {totalXP}</div>
                </div>
              </div>
            )}
            {currentLevel !== undefined && totalLevels !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="text-sm opacity-90">Level</div>
                  <div className="text-xl font-bold">{currentLevel} / {totalLevels}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
