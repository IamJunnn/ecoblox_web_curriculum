'use client'

import { Check } from 'lucide-react'

interface StepCheckboxProps {
  stepNumber: number
  title: string
  description: string
  checked: boolean
  onToggle: () => void
}

export default function StepCheckbox({ stepNumber, title, description, checked, onToggle }: StepCheckboxProps) {
  return (
    <li className={`flex gap-4 p-6 rounded-lg border-2 transition-all ${
      checked
        ? 'bg-green-50 border-green-500'
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex-shrink-0">
        <button
          onClick={onToggle}
          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
            checked
              ? 'bg-green-500 border-green-500'
              : 'bg-white border-gray-300 hover:border-green-500'
          }`}
        >
          {checked && <Check className="w-5 h-5 text-white" />}
        </button>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
            checked ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {stepNumber}
          </div>
          <h3 className={`text-lg font-bold ${checked ? 'text-green-700' : 'text-gray-900'}`}>
            {title}
          </h3>
        </div>
        <p className={`text-sm ${checked ? 'text-green-600' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </li>
  )
}
