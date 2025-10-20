// ===========================
// API CONFIGURATION
// ===========================

const API_CONFIG = {
  baseURL: 'http://localhost:3300/api',
  endpoints: {
    students: '/students',
    student: '/students/',
    stats: '/stats',
    progress: '/progress'
  }
};

// ===========================
// DASHBOARD PAGE (index.html)
// ===========================

let allStudents = [];

// Load all students
async function loadStudents() {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.students}`);

    if (!response.ok) throw new Error('Failed to fetch students');

    const data = await response.json();
    allStudents = data.students;

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

// Display students in table
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
        <small>${formatDate(student.last_active) || 'Never'}</small>
      </td>
      <td>
        <a href="student-detail.html?id=${student.id}" class="btn btn-sm btn-primary">
          View Details
        </a>
      </td>
    </tr>
  `).join('');
}

// Load statistics
async function loadStats() {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.stats}`);
    const data = await response.json();

    document.getElementById('totalStudents').textContent = data.total_students || 0;
    document.getElementById('activeStudents').textContent = data.active_now || 0;

    // Calculate average progress
    if (allStudents.length > 0) {
      const avgProgress = allStudents.reduce((sum, s) => sum + (s.progress_percentage || 0), 0) / allStudents.length;
      document.getElementById('avgProgress').textContent = Math.round(avgProgress) + '%';
    }

  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Populate class filter dropdown
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

// Refresh data
function refreshData() {
  loadStudents();
}

// Search students
document.getElementById('searchBox')?.addEventListener('input', (e) => {
  const search = e.target.value.toLowerCase();
  const filtered = allStudents.filter(s =>
    s.name.toLowerCase().includes(search)
  );
  displayStudents(filtered);
});

// Filter by class
document.getElementById('classFilter')?.addEventListener('change', (e) => {
  const classCode = e.target.value;
  const filtered = classCode ?
    allStudents.filter(s => s.class_code === classCode) :
    allStudents;
  displayStudents(filtered);
});

// Filter by progress
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
// STUDENT DETAIL PAGE
// ===========================

let currentStudentData = null;

// Load student detail
async function loadStudentDetail(studentId) {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.student}${studentId}`);

    if (!response.ok) throw new Error('Student not found');

    const data = await response.json();
    currentStudentData = data;

    displayStudentDetail(data);
    displayLevelProgress(data.progress_by_level);
    displayActivityChart(data.all_events);
    displayEventHistory(data.all_events);

  } catch (error) {
    console.error('Error loading student:', error);
    alert('Failed to load student data');
    window.location.href = 'index.html';
  }
}

// Display student header
function displayStudentDetail(data) {
  const student = data.student;
  const summary = data.summary;

  document.getElementById('studentName').textContent = student.name;
  document.getElementById('studentInfo').textContent =
    `${student.email || 'No email'} | Class: ${student.class_code || 'None'}`;

  document.getElementById('detailProgress').textContent = `${summary.progress_percentage || 0}%`;
  document.getElementById('detailLevel').textContent = summary.current_level || 0;
  document.getElementById('detailXP').textContent = summary.total_xp || 0;
  document.getElementById('detailSteps').textContent = summary.steps_completed || 0;
}

// Display progress by level
function displayLevelProgress(progressByLevel) {
  const container = document.getElementById('levelProgressContainer');

  if (!progressByLevel || Object.keys(progressByLevel).length === 0) {
    container.innerHTML = '<p class="text-muted">No progress yet</p>';
    return;
  }

  const levels = [1, 2, 3, 4, 5, 6];

  container.innerHTML = levels.map(levelNum => {
    const level = progressByLevel[levelNum] || { steps: [], quiz_attempts: [], status: 'not_started' };

    let statusClass = 'not-started';
    let statusText = 'Not Started';

    if (level.status === 'completed') {
      statusClass = 'completed';
      statusText = 'Completed';
    } else if (level.steps.length > 0 || level.quiz_attempts.length > 0) {
      statusClass = 'in-progress';
      statusText = 'In Progress';
    }

    return `
      <div class="level-progress-item ${statusClass}">
        <div class="level-header">
          <h6 class="level-title">Level ${levelNum}</h6>
          <span class="level-status ${statusClass}">${statusText}</span>
        </div>

        <div class="row">
          <div class="col-md-6">
            <strong>Steps Completed:</strong> ${level.steps.length}
            ${level.steps.length > 0 ? `<br><small class="text-muted">Steps: ${level.steps.join(', ')}</small>` : ''}
          </div>

          <div class="col-md-6">
            <strong>Quiz Attempts:</strong> ${level.quiz_attempts.length}
            ${level.quiz_attempts.length > 0 ? `<br><small class="text-muted">
              ${level.quiz_attempts.filter(q => q.correct).length} correct
            </small>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Display activity chart
function displayActivityChart(events) {
  if (!events || events.length === 0) return;

  // Group events by date
  const eventsByDate = {};

  events.forEach(event => {
    const date = new Date(event.timestamp).toLocaleDateString();
    eventsByDate[date] = (eventsByDate[date] || 0) + 1;
  });

  const dates = Object.keys(eventsByDate).sort();
  const counts = dates.map(date => eventsByDate[date]);

  const ctx = document.getElementById('progressChart');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Activities',
        data: counts,
        borderColor: '#ff6b35',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// Display event history
function displayEventHistory(events) {
  const tbody = document.getElementById('eventsTableBody');

  if (!events || events.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">No activity yet</td></tr>';
    return;
  }

  // Show last 20 events
  const recentEvents = events.slice(-20).reverse();

  tbody.innerHTML = recentEvents.map(event => {
    let details = '-';

    if (event.data) {
      try {
        const data = JSON.parse(event.data);
        if (data.step) details = `Step ${data.step}`;
        if (data.correct !== undefined) details = data.correct ? '✅ Correct' : '❌ Wrong';
      } catch (e) {}
    }

    return `
      <tr>
        <td><small>${formatDateTime(event.timestamp)}</small></td>
        <td><span class="badge bg-secondary">${event.event_type}</span></td>
        <td>Level ${event.level || '-'}</td>
        <td>${details}</td>
      </tr>
    `;
  }).join('');
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function formatDate(dateString) {
  if (!dateString) return null;

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

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}
