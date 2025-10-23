// ===========================
// TEACHER DASHBOARD
// ===========================
// Teacher dashboard logic with shared module imports

// Import from shared modules
import { API_CONFIG } from '../../shared/js/constants.js';
import {
  getSession,
  requireLogin,
  requireRole,
  clearSession
} from '../../shared/js/session.js';
import { getAllStudents, getStats } from '../../shared/js/api-client.js';
import { formatRelativeTime } from '../../shared/js/utils.js';

// ===========================
// STATE
// ===========================

let allStudents = [];

// ===========================
// INITIALIZATION
// ===========================

window.addEventListener('DOMContentLoaded', () => {
  // Require login and teacher/admin role
  if (!requireRole(['teacher', 'admin'], '../index.html')) {
    return;
  }

  // Update header with logged-in user info
  updateHeaderUserInfo();

  // Setup logout button
  setupLogoutButton();

  // Load students
  loadStudents();
});

// ===========================
// UPDATE HEADER USER INFO
// ===========================

function updateHeaderUserInfo() {
  const session = getSession();
  if (!session) return;

  // Update teacher name
  const nameHeader = document.getElementById('teacherNameHeader');
  if (nameHeader) {
    nameHeader.textContent = session.name || 'Teacher';
  }

  // Update role badge
  const roleBadge = document.getElementById('teacherRoleBadge');
  if (roleBadge) {
    const roleText = session.role === 'admin' ? 'Admin' : 'Teacher';
    roleBadge.textContent = roleText;

    // Different styling for admin
    if (session.role === 'admin') {
      roleBadge.classList.remove('bg-light', 'text-dark');
      roleBadge.classList.add('bg-danger', 'text-white');
    }
  }
}

// ===========================
// LOAD STUDENTS
// ===========================

async function loadStudents() {
  try {
    const data = await getAllStudents();
    // Filter to show ONLY students (exclude teachers and admins)
    allStudents = data.students.filter(user => user.role === 'student');

    displayStudents(allStudents);
    loadStats();
    populateClassFilter();

  } catch (error) {
    console.error('Error loading students:', error);
    document.getElementById('studentsTableBody').innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-danger py-4">
          ❌ Failed to load students. Make sure the backend server is running.
        </td>
      </tr>
    `;
  }
}

// ===========================
// DISPLAY STUDENTS
// ===========================

function displayStudents(students) {
  const tbody = document.getElementById('studentsTableBody');

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4">
          No students found
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = students.map(student => `
    <tr>
      <td>
        <strong>${student.name}</strong>
      </td>
      <td>
        ${student.class_code || '<span class="text-muted">-</span>'}
      </td>
      <td>
        <span class="badge level-badge">Level ${student.current_level || 0}</span>
      </td>
      <td>
        <div class="progress">
          <div class="progress-bar" role="progressbar"
               style="width: ${student.progress_percentage || 0}%"
               aria-valuenow="${student.progress_percentage || 0}"
               aria-valuemin="0" aria-valuemax="100">
            ${student.progress_percentage || 0}%
          </div>
        </div>
      </td>
      <td>
        <span class="badge xp-badge">${student.total_xp || 0} XP</span>
      </td>
      <td>${student.quiz_score || '0/0'}</td>
      <td>
        <small>${formatRelativeTime(student.last_active) || 'Never'}</small>
      </td>
      <td>
        <a href="student-detail.html?id=${student.id}" class="btn btn-sm btn-primary">
          View Details
        </a>
      </td>
    </tr>
  `).join('');
}

// ===========================
// LOAD STATISTICS
// ===========================

async function loadStats() {
  try {
    // Use filtered student count instead of API total (which includes teachers/admins)
    document.getElementById('totalStudents').textContent = allStudents.length;

    // Calculate active students from filtered list (active in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const activeCount = allStudents.filter(s => {
      if (!s.last_active) return false;
      return new Date(s.last_active) > oneHourAgo;
    }).length;
    document.getElementById('activeStudents').textContent = activeCount;

    // Calculate average progress
    if (allStudents.length > 0) {
      const avgProgress = allStudents.reduce((sum, s) => sum + (s.progress_percentage || 0), 0) / allStudents.length;
      document.getElementById('avgProgress').textContent = Math.round(avgProgress) + '%';
    } else {
      document.getElementById('avgProgress').textContent = '0%';
    }

  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// ===========================
// POPULATE CLASS FILTER
// ===========================

function populateClassFilter() {
  const classFilter = document.getElementById('classFilter');
  if (!classFilter) return;

  const classes = [...new Set(allStudents.map(s => s.class_code).filter(Boolean))];

  classes.forEach(className => {
    const option = document.createElement('option');
    option.value = className;
    option.textContent = className;
    classFilter.appendChild(option);
  });
}

// ===========================
// REFRESH DATA
// ===========================

function refreshData() {
  loadStudents();
}

// ===========================
// SEARCH STUDENTS
// ===========================

document.getElementById('searchBox')?.addEventListener('input', (e) => {
  const search = e.target.value.toLowerCase();
  const filtered = allStudents.filter(s =>
    s.name.toLowerCase().includes(search)
  );
  displayStudents(filtered);
});

// ===========================
// FILTER BY CLASS
// ===========================

document.getElementById('classFilter')?.addEventListener('change', (e) => {
  const classCode = e.target.value;
  const filtered = classCode ?
    allStudents.filter(s => s.class_code === classCode) :
    allStudents;
  displayStudents(filtered);
});

// ===========================
// FILTER BY PROGRESS
// ===========================

document.getElementById('progressFilter')?.addEventListener('change', (e) => {
  const range = e.target.value;

  if (!range) {
    displayStudents(allStudents);
    return;
  }

  const [min, max] = range.split('-').map(Number);
  const filtered = allStudents.filter(s => {
    const progress = s.progress_percentage || 0;
    return progress >= min && progress <= max;
  });

  displayStudents(filtered);
});

// ===========================
// LOGOUT
// ===========================

function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        clearSession();
        window.location.href = '../index.html';
      }
    });
  }
}

// ===========================
// EXPORT TO WINDOW
// ===========================

window.refreshData = refreshData;
