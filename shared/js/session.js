// ===========================
// SESSION MANAGEMENT MODULE
// ===========================
// This module handles all session-related operations
// Used by student, teacher, and admin interfaces

import { SESSION_KEY, LAST_COURSE_KEY, PROGRESS_BACKUP_KEY, OFFLINE_QUEUE_KEY, ROLES } from './constants.js';

// ===========================
// SESSION MANAGEMENT
// ===========================

/**
 * Get current session from localStorage
 * @returns {Object|null} Session object or null if not logged in
 */
export function getSession() {
  const sessionData = localStorage.getItem(SESSION_KEY);
  return sessionData ? JSON.parse(sessionData) : null;
}

/**
 * Save session to localStorage
 * @param {Object} userData - User data from login response
 * @returns {Object} Saved session object
 */
export function saveSession(userData) {
  const session = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    class_code: userData.class_code,
    role: userData.role || ROLES.STUDENT,
    current_course_id: userData.current_course_id || 1,
    login_timestamp: new Date().toISOString(),
    last_active: new Date().toISOString()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/**
 * Update last active timestamp
 */
export function updateLastActive() {
  const session = getSession();
  if (session) {
    session.last_active = new Date().toISOString();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Clear session (logout)
 */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LAST_COURSE_KEY);
  localStorage.removeItem(PROGRESS_BACKUP_KEY);
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

/**
 * Check if user is logged in
 * @returns {boolean} True if logged in
 */
export function isLoggedIn() {
  return getSession() !== null;
}

/**
 * Get user role
 * @returns {string|null} User role or null if not logged in
 */
export function getUserRole() {
  const session = getSession();
  return session ? session.role : null;
}

/**
 * Check if user has specific role
 * @param {string} role - Role to check (student, teacher, admin)
 * @returns {boolean} True if user has the role
 */
export function hasRole(role) {
  return getUserRole() === role;
}

/**
 * Require login (redirect to index if not logged in)
 * @returns {boolean} True if logged in, false otherwise
 */
export function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

/**
 * Require specific role (redirect if user doesn't have role)
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @param {string} redirectUrl - URL to redirect to if access denied
 * @returns {boolean} True if user has required role
 */
export function requireRole(allowedRoles, redirectUrl = '/index.html') {
  if (!requireLogin()) return false;

  const userRole = getUserRole();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(userRole)) {
    alert('⚠️ Access Denied: You do not have permission to access this page.');
    window.location.href = redirectUrl;
    return false;
  }

  return true;
}

// ===========================
// COURSE TRACKING
// ===========================

/**
 * Save last course URL
 * @param {string} url - Course URL to save
 */
export function saveLastCourse(url) {
  localStorage.setItem(LAST_COURSE_KEY, url);
}

/**
 * Get last course URL
 * @returns {string|null} Last course URL or null
 */
export function getLastCourse() {
  return localStorage.getItem(LAST_COURSE_KEY);
}
