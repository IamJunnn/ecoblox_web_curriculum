// ===========================
// ADMIN - STUDENT DETAIL PAGE
// ===========================
// View individual student progress with shared module imports

// Import from shared modules
import { API_CONFIG } from '../../shared/js/constants.js';
import {
  getSession,
  requireLogin,
  requireRole
} from '../../shared/js/session.js';
import { getStudent } from '../../shared/js/api-client.js';
import { formatRelativeTime, formatDateTime } from '../../shared/js/utils.js';

// ===========================
// STATE
// ===========================

let currentStudentData = null;

// ===========================
// INITIALIZATION
// ===========================

window.addEventListener('DOMContentLoaded', () => {
  // Require login and admin role only
  if (!requireRole(['admin'], '../index.html')) {
    return;
  }

  // Get student ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');

  if (!studentId) {
    alert('No student ID provided');
    window.location.href = 'index.html';
    return;
  }

  // Load student detail
  loadStudentDetail(studentId);
});

// ===========================
// LOAD STUDENT DETAIL
// ===========================

async function loadStudentDetail(studentId) {
  try {
    const data = await getStudent(studentId);
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

// ===========================
// DISPLAY STUDENT HEADER
// ===========================

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

// ===========================
// DISPLAY PROGRESS BY LEVEL
// ===========================

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

// ===========================
// DISPLAY ACTIVITY CHART
// ===========================

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

// ===========================
// DISPLAY EVENT HISTORY
// ===========================

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
