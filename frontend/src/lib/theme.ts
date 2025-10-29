/**
 * Theme configuration for role-based styling
 */

export const ROLE_COLORS = {
  student: {
    primary: '#6B9E3E',      // Bright Green - friendly, learning-focused
    light: '#E8F5E0',        // Light green background
    dark: '#5A8533',         // Darker green for hover states
    text: '#FFFFFF',         // White text on colored backgrounds
  },
  teacher: {
    primary: '#2D5016',      // Dark Green - professional, authoritative
    light: '#E5EBE0',        // Light green-gray background
    dark: '#1F3810',         // Even darker for hover states
    text: '#FFFFFF',         // White text on colored backgrounds
  },
  admin: {
    primary: '#3CBB90',      // Teal/Mint - administrative, system-level
    light: '#E0F5EF',        // Light teal background
    dark: '#2FA077',         // Darker teal for hover states
    text: '#FFFFFF',         // White text on colored backgrounds
  },
} as const;

export type UserRole = 'student' | 'teacher' | 'admin';

/**
 * Get theme colors for a specific role
 */
export function getRoleTheme(role: UserRole) {
  return ROLE_COLORS[role];
}

/**
 * Tailwind CSS class utilities for role-based styling
 */
export const ROLE_CLASSES = {
  student: {
    bg: 'bg-[#6B9E3E]',
    bgHover: 'hover:bg-[#5A8533]',
    bgLight: 'bg-[#E8F5E0]',
    text: 'text-[#6B9E3E]',
    textWhite: 'text-white',
    border: 'border-[#6B9E3E]',
  },
  teacher: {
    bg: 'bg-[#2D5016]',
    bgHover: 'hover:bg-[#1F3810]',
    bgLight: 'bg-[#E5EBE0]',
    text: 'text-[#2D5016]',
    textWhite: 'text-white',
    border: 'border-[#2D5016]',
  },
  admin: {
    bg: 'bg-[#3CBB90]',
    bgHover: 'hover:bg-[#2FA077]',
    bgLight: 'bg-[#E0F5EF]',
    text: 'text-[#3CBB90]',
    textWhite: 'text-white',
    border: 'border-[#3CBB90]',
  },
} as const;
