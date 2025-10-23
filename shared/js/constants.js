// ===========================
// SHARED CONSTANTS
// ===========================
// This file contains all shared configuration constants
// used across student, teacher, and admin interfaces

export const API_CONFIG = {
  baseURL: 'http://localhost:3300/api',
  endpoints: {
    students: '/students',
    student: '/students/',
    stats: '/stats',
    progress: '/progress',
    courses: '/courses',
    dashboard: '/student/dashboard',
    auth: {
      login: '/auth/login',
      studentLogin: '/auth/student-login',
      logout: '/auth/logout'
    },
    admin: {
      teachers: '/admin/teachers',
      teacher: '/admin/teacher/',
      student: '/admin/student/',
      resetPIN: '/admin/reset-pin/',
      resetProgress: '/admin/reset-progress/'
    }
  }
};

// Session Storage Keys
export const SESSION_KEY = 'studentSession';
export const LAST_COURSE_KEY = 'lastCourseUrl';
export const PROGRESS_BACKUP_KEY = 'progressBackup';
export const OFFLINE_QUEUE_KEY = 'offlineQueue';

// User Roles
export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
};

// XP and Rank Thresholds
export const RANK_THRESHOLDS = {
  EXPERT: 1000,
  ADVANCED: 600,
  INTERMEDIATE: 300,
  APPRENTICE: 100,
  BEGINNER: 0
};

export const RANK_NAMES = {
  EXPERT: 'Expert',
  ADVANCED: 'Advanced',
  INTERMEDIATE: 'Intermediate',
  APPRENTICE: 'Apprentice',
  BEGINNER: 'Beginner'
};

// Level Configuration
export const TOTAL_LEVELS = 6;
export const STEPS_PER_LEVEL = 4;

// Time Constants (milliseconds)
export const TIME = {
  MINUTE: 60000,
  HOUR: 3600000,
  DAY: 86400000,
  WEEK: 604800000
};
