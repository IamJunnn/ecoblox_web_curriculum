'use client'

import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'success' | 'danger' | 'warning'
  icon?: 'check' | 'alert' | 'warning'
  details?: string[]
  showConfirmButton?: boolean
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'success',
  icon = 'check',
  details = [],
  showConfirmButton = true
}: ConfirmDialogProps) {
  if (!isOpen) return null

  // Define color schemes based on variant
  const colorSchemes = {
    success: {
      confirmBg: '#6B9E3E',
      confirmHover: '#5A8533',
      iconColor: '#6B9E3E'
    },
    danger: {
      confirmBg: '#DC2626',
      confirmHover: '#B91C1C',
      iconColor: '#DC2626'
    },
    warning: {
      confirmBg: '#F59E0B',
      confirmHover: '#D97706',
      iconColor: '#F59E0B'
    }
  }

  const colors = colorSchemes[variant]

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2A2A] rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 border border-gray-700">
        {/* Content */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
               style={{ backgroundColor: `${colors.iconColor}20` }}>
            {icon === 'check' ? (
              <CheckCircle className="w-8 h-8" style={{ color: colors.iconColor }} />
            ) : icon === 'warning' ? (
              <AlertTriangle className="w-8 h-8" style={{ color: colors.iconColor }} />
            ) : (
              <AlertCircle className="w-8 h-8" style={{ color: colors.iconColor }} />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
          <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">{message}</p>

          {/* Details List */}
          {details.length > 0 && (
            <div className="mt-4 bg-[#1A1A1A] rounded-lg p-4 max-h-48 overflow-y-auto">
              <ul className="text-left text-gray-300 text-sm space-y-2">
                {details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex gap-3">
          {showConfirmButton && (
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 rounded-lg text-white font-semibold transition-all shadow-md"
              style={{ backgroundColor: colors.confirmBg }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors.confirmHover)}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.confirmBg)}
            >
              {confirmText}
            </button>
          )}
          <button
            onClick={onCancel}
            className={`${showConfirmButton ? 'flex-1' : 'w-full'} px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-colors`}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}
