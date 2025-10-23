// ===========================
// API CLIENT MODULE
// ===========================
// This module provides wrapper functions for all API calls
// Used by student, teacher, and admin interfaces

import { API_CONFIG } from './constants.js';

// ===========================
// GENERIC API FUNCTIONS
// ===========================

/**
 * Make a GET request to the API
 * @param {string} endpoint - API endpoint path
 * @returns {Promise<Object>} Response data
 */
export async function apiGet(endpoint) {
  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Make a POST request to the API
 * @param {string} endpoint - API endpoint path
 * @param {Object} data - Request body data
 * @returns {Promise<Object>} Response data
 */
export async function apiPost(endpoint, data) {
  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Make a PUT request to the API
 * @param {string} endpoint - API endpoint path
 * @param {Object} data - Request body data
 * @returns {Promise<Object>} Response data
 */
export async function apiPut(endpoint, data) {
  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Make a DELETE request to the API
 * @param {string} endpoint - API endpoint path
 * @returns {Promise<Object>} Response data
 */
export async function apiDelete(endpoint) {
  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ===========================
// AUTHENTICATION API
// ===========================

/**
 * Student login with PIN
 * @param {string} email - Student email
 * @param {string} pin - 4-digit PIN
 * @returns {Promise<Object>} Login response with student data
 */
export async function studentLogin(email, pin) {
  return apiPost(API_CONFIG.endpoints.auth.studentLogin, { email, pin });
}

/**
 * Teacher/Admin login with password
 * @param {string} email - User email
 * @param {string} password - Password
 * @param {string} role - User role (teacher or admin)
 * @returns {Promise<Object>} Login response with user data
 */
export async function passwordLogin(email, password, role) {
  return apiPost(API_CONFIG.endpoints.auth.login, { email, password, role });
}

// ===========================
// STUDENT DATA API
// ===========================

/**
 * Get all students with summary data
 * @returns {Promise<Object>} List of students with progress
 */
export async function getAllStudents() {
  return apiGet(API_CONFIG.endpoints.students);
}

/**
 * Get individual student details
 * @param {number} studentId - Student ID
 * @returns {Promise<Object>} Student details with progress
 */
export async function getStudent(studentId) {
  return apiGet(`${API_CONFIG.endpoints.student}${studentId}`);
}

/**
 * Get student dashboard data
 * @param {number} studentId - Student ID
 * @returns {Promise<Object>} Dashboard data
 */
export async function getStudentDashboard(studentId) {
  return apiGet(`${API_CONFIG.endpoints.dashboard}/${studentId}`);
}

// ===========================
// PROGRESS TRACKING API
// ===========================

/**
 * Save student progress event
 * @param {Object} progressData - Progress event data
 * @returns {Promise<Object>} Response
 */
export async function saveProgress(progressData) {
  return apiPost(API_CONFIG.endpoints.progress, progressData);
}

// ===========================
// STATISTICS API
// ===========================

/**
 * Get overall statistics
 * @returns {Promise<Object>} Statistics data
 */
export async function getStats() {
  return apiGet(API_CONFIG.endpoints.stats);
}

// ===========================
// COURSES API
// ===========================

/**
 * Get all courses
 * @returns {Promise<Object>} List of courses
 */
export async function getCourses() {
  return apiGet(API_CONFIG.endpoints.courses);
}

// ===========================
// ADMIN API
// ===========================

/**
 * Get all teachers/admins
 * @returns {Promise<Object>} List of teachers and admins
 */
export async function getTeachers() {
  return apiGet(API_CONFIG.endpoints.admin.teachers);
}

/**
 * Add new student (admin only)
 * @param {Object} studentData - Student data
 * @returns {Promise<Object>} Created student
 */
export async function addStudent(studentData) {
  return apiPost(API_CONFIG.endpoints.admin.student, studentData);
}

/**
 * Update student (admin only)
 * @param {number} studentId - Student ID
 * @param {Object} studentData - Updated student data
 * @returns {Promise<Object>} Updated student
 */
export async function updateStudent(studentId, studentData) {
  return apiPut(`${API_CONFIG.endpoints.admin.student}${studentId}`, studentData);
}

/**
 * Delete student (admin only)
 * @param {number} studentId - Student ID
 * @returns {Promise<Object>} Response
 */
export async function deleteStudent(studentId) {
  return apiDelete(`${API_CONFIG.endpoints.admin.student}${studentId}`);
}

/**
 * Add new teacher (admin only)
 * @param {Object} teacherData - Teacher data
 * @returns {Promise<Object>} Created teacher
 */
export async function addTeacher(teacherData) {
  return apiPost(API_CONFIG.endpoints.admin.teacher, teacherData);
}

/**
 * Update teacher (admin only)
 * @param {number} teacherId - Teacher ID
 * @param {Object} teacherData - Updated teacher data
 * @returns {Promise<Object>} Updated teacher
 */
export async function updateTeacher(teacherId, teacherData) {
  return apiPut(`${API_CONFIG.endpoints.admin.teacher}${teacherId}`, teacherData);
}

/**
 * Delete teacher (admin only)
 * @param {number} teacherId - Teacher ID
 * @returns {Promise<Object>} Response
 */
export async function deleteTeacher(teacherId) {
  return apiDelete(`${API_CONFIG.endpoints.admin.teacher}${teacherId}`);
}

/**
 * Reset student PIN (admin only)
 * @param {number} studentId - Student ID
 * @returns {Promise<Object>} New PIN
 */
export async function resetStudentPIN(studentId) {
  return apiPost(`${API_CONFIG.endpoints.admin.resetPIN}${studentId}`, {});
}

/**
 * Reset student progress (admin only)
 * @param {number} studentId - Student ID
 * @returns {Promise<Object>} Response
 */
export async function resetStudentProgress(studentId) {
  return apiDelete(`${API_CONFIG.endpoints.admin.resetProgress}${studentId}`);
}
