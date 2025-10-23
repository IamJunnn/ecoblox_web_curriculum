// ===========================
// UTILITY FUNCTIONS MODULE
// ===========================
// This module contains shared utility functions
// Used by student, teacher, and admin interfaces

import { TIME, RANK_THRESHOLDS, RANK_NAMES } from './constants.js';

// ===========================
// DATE & TIME FORMATTING
// ===========================

/**
 * Format date as relative time (e.g., "5m ago", "2h ago")
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted relative time
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / TIME.MINUTE);
  const hours = Math.floor(diff / TIME.HOUR);
  const days = Math.floor(diff / TIME.DAY);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

/**
 * Format date with time
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date and time
 */
export function formatDateTime(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString();
}

/**
 * Format date only
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// ===========================
// XP & RANK CALCULATIONS
// ===========================

/**
 * Calculate rank based on XP
 * @param {number} xp - Total XP
 * @returns {string} Rank name
 */
export function calculateRank(xp) {
  if (xp >= RANK_THRESHOLDS.EXPERT) return RANK_NAMES.EXPERT;
  if (xp >= RANK_THRESHOLDS.ADVANCED) return RANK_NAMES.ADVANCED;
  if (xp >= RANK_THRESHOLDS.INTERMEDIATE) return RANK_NAMES.INTERMEDIATE;
  if (xp >= RANK_THRESHOLDS.APPRENTICE) return RANK_NAMES.APPRENTICE;
  return RANK_NAMES.BEGINNER;
}

/**
 * Calculate progress to next rank
 * @param {number} xp - Current XP
 * @returns {Object} Progress info with current rank, next rank, and percentage
 */
export function calculateRankProgress(xp) {
  const currentRank = calculateRank(xp);
  let nextThreshold, nextRank;

  if (xp < RANK_THRESHOLDS.APPRENTICE) {
    nextThreshold = RANK_THRESHOLDS.APPRENTICE;
    nextRank = RANK_NAMES.APPRENTICE;
  } else if (xp < RANK_THRESHOLDS.INTERMEDIATE) {
    nextThreshold = RANK_THRESHOLDS.INTERMEDIATE;
    nextRank = RANK_NAMES.INTERMEDIATE;
  } else if (xp < RANK_THRESHOLDS.ADVANCED) {
    nextThreshold = RANK_THRESHOLDS.ADVANCED;
    nextRank = RANK_NAMES.ADVANCED;
  } else if (xp < RANK_THRESHOLDS.EXPERT) {
    nextThreshold = RANK_THRESHOLDS.EXPERT;
    nextRank = RANK_NAMES.EXPERT;
  } else {
    return {
      currentRank,
      nextRank: null,
      xpToNext: 0,
      progressPercentage: 100
    };
  }

  const previousThresholds = [0, RANK_THRESHOLDS.APPRENTICE, RANK_THRESHOLDS.INTERMEDIATE, RANK_THRESHOLDS.ADVANCED];
  const prevThreshold = previousThresholds.find(t => t <= xp && xp < nextThreshold) || 0;

  const xpInCurrentRank = xp - prevThreshold;
  const xpNeededForNext = nextThreshold - prevThreshold;
  const progressPercentage = Math.floor((xpInCurrentRank / xpNeededForNext) * 100);

  return {
    currentRank,
    nextRank,
    xpToNext: nextThreshold - xp,
    progressPercentage
  };
}

// ===========================
// PROGRESS CALCULATIONS
// ===========================

/**
 * Calculate overall progress percentage
 * @param {number} currentLevel - Current level (1-6)
 * @param {number} stepsCompleted - Steps completed in current level
 * @param {number} totalLevels - Total number of levels
 * @param {number} stepsPerLevel - Steps per level
 * @returns {number} Progress percentage (0-100)
 */
export function calculateProgressPercentage(currentLevel, stepsCompleted, totalLevels = 6, stepsPerLevel = 4) {
  const completedLevels = Math.max(0, currentLevel - 1);
  const totalSteps = totalLevels * stepsPerLevel;
  const completedSteps = (completedLevels * stepsPerLevel) + stepsCompleted;

  return Math.floor((completedSteps / totalSteps) * 100);
}

/**
 * Calculate badge count from XP
 * @param {number} xp - Total XP
 * @param {number} xpPerBadge - XP required per badge (default: 100)
 * @returns {number} Number of badges earned
 */
export function calculateBadges(xp, xpPerBadge = 100) {
  return Math.floor(xp / xpPerBadge);
}

// ===========================
// VALIDATION
// ===========================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate PIN format (4 digits)
 * @param {string} pin - PIN to validate
 * @returns {boolean} True if valid PIN
 */
export function isValidPIN(pin) {
  return /^\d{4}$/.test(pin);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  return { isValid: true, message: 'Password is strong' };
}

// ===========================
// STRING FORMATTING
// ===========================

/**
 * Truncate string to max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string with ellipsis if needed
 */
export function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export function toTitleCase(str) {
  if (!str) return '';
  return str.split(' ').map(capitalize).join(' ');
}

// ===========================
// ARRAY UTILITIES
// ===========================

/**
 * Get unique values from array
 * @param {Array} arr - Input array
 * @returns {Array} Array with unique values
 */
export function unique(arr) {
  return [...new Set(arr)];
}

/**
 * Sort array by property
 * @param {Array} arr - Array to sort
 * @param {string} property - Property to sort by
 * @param {boolean} ascending - Sort ascending (default: true)
 * @returns {Array} Sorted array
 */
export function sortBy(arr, property, ascending = true) {
  return [...arr].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];

    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
}

// ===========================
// NUMBER FORMATTING
// ===========================

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return num.toLocaleString();
}

/**
 * Format percentage
 * @param {number} value - Value (0-100)
 * @param {number} decimals - Decimal places (default: 0)
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 0) {
  return value.toFixed(decimals) + '%';
}
