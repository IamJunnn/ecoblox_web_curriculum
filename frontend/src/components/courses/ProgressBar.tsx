'use client'

import { ROLE_COLORS } from '@/lib/theme'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100)

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold" style={{ color: ROLE_COLORS.student.primary }}>
            {percentage}%
          </span>
        </div>
      )}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: ROLE_COLORS.student.primary
          }}
        />
      </div>
    </div>
  )
}
