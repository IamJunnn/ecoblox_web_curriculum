// ===========================
// AUTHENTICATION & SESSION MANAGEMENT
// ===========================

const API_CONFIG = {
  baseURL: 'http://localhost:3300/api',
  endpoints: {
    students: '/students',
    student: '/students/',
    stats: '/stats',
    progress: '/progress',
    courses: '/courses',
    dashboard: '/student/dashboard'
  }
};

// Session Storage Keys
const SESSION_KEY = 'studentSession';
const LAST_COURSE_KEY = 'lastCourseUrl';

// ===========================
// SESSION MANAGEMENT
// ===========================

// Get current session
function getSession() {
  const sessionData = localStorage.getItem(SESSION_KEY);
  return sessionData ? JSON.parse(sessionData) : null;
}

// Save session
function saveSession(userData) {
  const session = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    class_code: userData.class_code,
    role: userData.role || 'student',
    current_course_id: userData.current_course_id || 1,
    login_timestamp: new Date().toISOString(),
    last_active: new Date().toISOString()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

// Update last active
function updateLastActive() {
  const session = getSession();
  if (session) {
    session.last_active = new Date().toISOString();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

// Clear session (logout)
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LAST_COURSE_KEY);
  localStorage.removeItem('progressBackup');
  localStorage.removeItem('offlineQueue');
}

// Check if logged in
function isLoggedIn() {
  return getSession() !== null;
}

// Save last course URL
function saveLastCourse(url) {
  localStorage.setItem(LAST_COURSE_KEY, url);
}

// Get last course URL
function getLastCourse() {
  return localStorage.getItem(LAST_COURSE_KEY);
}

// ===========================
// LANDING PAGE FUNCTIONS
// ===========================

function initializeLandingPage() {
  // Check if user has an existing session
  const session = getSession();

  if (session) {
    // Show resume button
    const resumeBtn = document.getElementById('resumeBtn');
    const resumeInfo = document.getElementById('resumeInfo');
    const resumeName = document.getElementById('resumeName');

    if (resumeBtn) resumeBtn.style.display = 'block';
    if (resumeInfo) resumeInfo.style.display = 'block';
    if (resumeName) resumeName.textContent = session.name + ' (' + session.role + ')';
  }

  // Handle student login form submission
  const studentForm = document.getElementById('studentLoginForm');
  if (studentForm) {
    studentForm.addEventListener('submit', handleStudentLogin);
  }

  // Handle teacher login form submission
  const teacherForm = document.getElementById('teacherLoginForm');
  if (teacherForm) {
    teacherForm.addEventListener('submit', (e) => handlePasswordLogin(e, 'teacher'));
  }

  // Handle admin login form submission
  const adminForm = document.getElementById('adminLoginForm');
  if (adminForm) {
    adminForm.addEventListener('submit', (e) => handlePasswordLogin(e, 'admin'));
  }

  // Handle resume button
  const resumeBtn = document.getElementById('resumeBtn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', handleResume);
  }
}

// Handle Student Login (With PIN Code)
async function handleStudentLogin(e) {
  e.preventDefault();

  const email = document.getElementById('studentEmail').value.trim();
  const pin = document.getElementById('studentPIN').value.trim();

  if (!email || !pin) {
    alert('Please fill in all fields');
    return;
  }

  // Validate PIN format
  if (!/^\d{4}$/.test(pin)) {
    alert('PIN must be exactly 4 digits');
    return;
  }

  try {
    // Authenticate with PIN
    const response = await fetch(`${API_CONFIG.baseURL}/auth/student-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        pin: pin
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid email or PIN');
    }

    const result = await response.json();

    // Save session
    const session = saveSession(result.student);

    // Redirect to student dashboard
    window.location.href = 'dashboard.html';

  } catch (error) {
    console.error('Login error:', error);
    alert(error.message || 'Failed to login. Please check your email and PIN, or ask your teacher for help.');
  }
}

// Handle Teacher/Admin Login (With Password)
async function handlePasswordLogin(e, role) {
  e.preventDefault();

  const email = document.getElementById(role + 'Email').value.trim();
  const password = document.getElementById(role + 'Password').value.trim();

  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  try {
    // Authenticate with backend
    const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: password,
        role: role
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const result = await response.json();

    // Save session
    const session = saveSession(result.user);

    // Redirect based on role
    redirectToRoleDashboard(result.user.role);

  } catch (error) {
    console.error('Login error:', error);
    alert(error.message || 'Invalid credentials. Please try again.');
  }
}

// Handle resume session
function handleResume() {
  const session = getSession();

  if (!session) {
    alert('No active session found');
    return;
  }

  // Update last active
  updateLastActive();

  // Redirect based on role
  redirectToRoleDashboard(session.role);
}

// Redirect to appropriate dashboard based on role
function redirectToRoleDashboard(role) {
  switch(role) {
    case 'admin':
      window.location.href = 'admin/index.html';
      break;
    case 'teacher':
      window.location.href = 'admin/index.html'; // Teachers use admin dashboard for now
      break;
    case 'student':
    default:
      window.location.href = 'dashboard.html';
      break;
  }
}

// Load live stats for landing page
async function loadLiveStats() {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.stats}`);

    if (!response.ok) return;

    const data = await response.json();

    // Update stats
    document.getElementById('studentsOnline').textContent = data.total_students || 0;

    // Calculate courses completed (students with progress > 80%)
    const studentsResponse = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.students}`);
    if (studentsResponse.ok) {
      const studentsData = await studentsResponse.json();
      const completed = studentsData.students.filter(s =>
        (s.progress_percentage || 0) >= 80
      ).length;
      document.getElementById('coursesCompleted').textContent = completed;
    }

  } catch (error) {
    console.error('Failed to load stats:', error);
    // Show placeholder values
    document.getElementById('studentsOnline').textContent = '0';
    document.getElementById('coursesCompleted').textContent = '0';
  }
}

// ===========================
// DASHBOARD PROTECTION
// ===========================

function requireLogin() {
  if (!isLoggedIn()) {
    // Redirect to landing page if not logged in
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// ===========================
// LOGOUT FUNCTION
// ===========================

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    clearSession();
    window.location.href = 'index.html';
  }
}

// Setup logout button
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});

// ===========================
// UTILITY FUNCTIONS
// ===========================

function formatRelativeTime(dateString) {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

// Calculate rank based on XP
function calculateRank(xp) {
  if (xp >= 1000) return 'Expert';
  if (xp >= 600) return 'Advanced';
  if (xp >= 300) return 'Intermediate';
  if (xp >= 100) return 'Apprentice';
  return 'Beginner';
}

// Export functions for global use
window.getSession = getSession;
window.saveSession = saveSession;
window.updateLastActive = updateLastActive;
window.clearSession = clearSession;
window.isLoggedIn = isLoggedIn;
window.saveLastCourse = saveLastCourse;
window.getLastCourse = getLastCourse;
window.requireLogin = requireLogin;
window.logout = logout;
window.formatRelativeTime = formatRelativeTime;
window.calculateRank = calculateRank;
window.redirectToRoleDashboard = redirectToRoleDashboard;
window.initializeLandingPage = initializeLandingPage;
window.loadLiveStats = loadLiveStats;
window.API_CONFIG = API_CONFIG;
