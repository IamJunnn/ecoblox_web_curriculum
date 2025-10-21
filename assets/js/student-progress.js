// ===========================
// STUDENT PROGRESS PAGE - SECURE
// Students can ONLY view their own progress
// NO URL parameters - uses session ID
// ===========================

let currentStudentData = null;
let currentSession = null;

// ===========================
// INITIALIZATION WITH ACCESS CONTROL
// ===========================

window.addEventListener('DOMContentLoaded', () => {
  // SECURITY CHECK 1: Verify user is logged in
  if (!requireLogin()) {
    return; // requireLogin() redirects to login page
  }

  // SECURITY CHECK 2: Get session
  currentSession = getSession();

  if (!currentSession || !currentSession.id) {
    alert('Invalid session. Please login again.');
    clearSession();
    window.location.href = 'index.html';
    return;
  }

  // SECURITY CHECK 3: Verify user is a student
  if (currentSession.role !== 'student') {
    alert('This page is for students only. Teachers and admins should use the admin dashboard.');
    redirectToRoleDashboard(currentSession.role);
    return;
  }

  // SECURITY: Always use session ID - ignore any URL parameters
  const studentId = currentSession.id;

  // Update page title with student name
  document.title = `My Progress - ${currentSession.name}`;

  // Load student's OWN progress data
  loadStudentProgress(studentId);
});

// ===========================
// LOAD STUDENT PROGRESS (SECURE)
// ===========================

async function loadStudentProgress(studentId) {
  try {
    // Fetch student progress from API
    const response = await fetch(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.student}${studentId}`
    );

    if (!response.ok) {
      throw new Error('Failed to load progress data');
    }

    const data = await response.json();
    currentStudentData = data;

    // Display all progress sections
    displayStudentSummary(data);
    displayLevelProgress(data.progress_by_level);
    displayActivityChart(data.all_events);
    displayEventHistory(data.all_events);
    displayAchievements(data);

  } catch (error) {
    console.error('Error loading progress:', error);

    // Show error message
    document.getElementById('studentInfo').textContent =
      'Failed to load your progress. Please try again later.';

    // Show error in containers
    const errorMsg = '<div class="alert alert-warning">Unable to load progress data. Please refresh the page or contact your teacher if the problem persists.</div>';
    document.getElementById('levelProgressContainer').innerHTML = errorMsg;
  }
}

// ===========================
// DISPLAY STUDENT SUMMARY
// ===========================

function displayStudentSummary(data) {
  const student = data.student;
  const summary = data.summary;

  // Update header info
  document.getElementById('studentInfo').textContent =
    `${student.email || 'No email'} | Class: ${student.class_code || 'None'} | Last Active: ${formatRelativeTime(student.last_active)}`;

  // Update summary cards
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
    container.innerHTML = `
      <div class="text-center py-4">
        <p class="text-muted">You haven't started any levels yet!</p>
        <p class="mb-0">Go to your <a href="dashboard.html">Dashboard</a> to start learning.</p>
      </div>
    `;
    return;
  }

  const levels = [1, 2, 3, 4, 5, 6];

  container.innerHTML = levels.map(levelNum => {
    const level = progressByLevel[levelNum] || {
      steps: [],
      quiz_attempts: [],
      status: 'not_started'
    };

    // Determine status
    let statusClass = 'secondary';
    let statusIcon = '⬜';
    let statusText = 'Not Started';

    if (level.status === 'completed') {
      statusClass = 'success';
      statusIcon = '✅';
      statusText = 'Completed';
    } else if (level.steps.length > 0 || level.quiz_attempts.length > 0) {
      statusClass = 'primary';
      statusIcon = '📍';
      statusText = 'In Progress';
    }

    // Quiz status
    let quizStatus = '';
    if (level.quiz_attempts && level.quiz_attempts.length > 0) {
      const correctAttempts = level.quiz_attempts.filter(q => q.correct).length;
      const totalAttempts = level.quiz_attempts.length;
      const quizClass = correctAttempts > 0 ? 'success' : 'warning';
      quizStatus = `<span class="badge bg-${quizClass}">Quiz: ${correctAttempts}/${totalAttempts} correct</span>`;
    }

    return `
      <div class="level-progress-item mb-3 p-3 border rounded">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="mb-0">${statusIcon} Level ${levelNum}</h6>
          <span class="badge bg-${statusClass}">${statusText}</span>
        </div>

        ${level.steps.length > 0 || level.quiz_attempts.length > 0 ? `
          <div class="level-details mt-2">
            <small class="text-muted">
              ${level.steps.length > 0 ? `✓ ${level.steps.length} steps completed` : ''}
              ${level.steps.length > 0 && quizStatus ? ' | ' : ''}
              ${quizStatus}
            </small>
          </div>
        ` : `
          <small class="text-muted">Start this level to see your progress</small>
        `}
      </div>
    `;
  }).join('');
}

// ===========================
// DISPLAY ACTIVITY CHART
// ===========================

function displayActivityChart(events) {
  if (!events || events.length === 0) {
    document.getElementById('progressChart').parentElement.innerHTML =
      '<p class="text-center text-muted py-4">No activity data yet. Start learning to see your progress chart!</p>';
    return;
  }

  // Group events by date
  const eventsByDate = {};

  events.forEach(event => {
    const date = new Date(event.timestamp).toLocaleDateString();
    if (!eventsByDate[date]) {
      eventsByDate[date] = 0;
    }
    eventsByDate[date]++;
  });

  // Prepare chart data
  const dates = Object.keys(eventsByDate).sort();
  const counts = dates.map(date => eventsByDate[date]);

  // Create chart
  const ctx = document.getElementById('progressChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Activity Events',
        data: counts,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Your Learning Activity Over Time'
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
  const tbody = document.getElementById('eventHistoryTable');

  if (!events || events.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No activity yet. Start learning to build your history!</td></tr>';
    return;
  }

  // Show last 20 events
  const recentEvents = events.slice(0, 20);

  tbody.innerHTML = recentEvents.map(event => {
    // Event type icon and label
    let eventIcon = '📝';
    let eventLabel = event.event_type;

    switch(event.event_type) {
      case 'session_start':
        eventIcon = '🚀';
        eventLabel = 'Started Session';
        break;
      case 'step_checked':
        eventIcon = '✅';
        eventLabel = 'Step Completed';
        break;
      case 'quiz_answered':
        eventIcon = '📝';
        eventLabel = 'Quiz Answered';
        break;
      case 'level_unlocked':
        eventIcon = '🎉';
        eventLabel = 'Level Unlocked';
        break;
    }

    // Event details
    let details = '-';
    if (event.data) {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.step) details = `Step ${data.step}`;
        if (data.correct !== undefined) details = data.correct ? '✓ Correct' : '✗ Incorrect';
        if (data.xp_earned) details = `+${data.xp_earned} XP`;
      } catch (e) {
        // Ignore parse errors
      }
    }

    return `
      <tr>
        <td>${eventIcon} ${eventLabel}</td>
        <td>Level ${event.level || '-'}</td>
        <td>${details}</td>
        <td><small class="text-muted">${formatRelativeTime(event.timestamp)}</small></td>
      </tr>
    `;
  }).join('');
}

// ===========================
// DISPLAY ACHIEVEMENTS
// ===========================

function displayAchievements(data) {
  const container = document.getElementById('achievementsContainer');
  const summary = data.summary || {};
  const totalXP = summary.total_xp || 0;
  const currentLevel = summary.current_level || 0;
  const stepsCompleted = summary.steps_completed || 0;

  // Define achievements
  const achievements = [
    {
      id: 'first_steps',
      title: '🎯 First Steps',
      description: 'Complete your first step',
      earned: stepsCompleted >= 1,
      progress: Math.min(stepsCompleted, 1),
      total: 1
    },
    {
      id: 'level_1',
      title: '🌟 Level 1 Master',
      description: 'Complete Level 1',
      earned: currentLevel >= 2,
      progress: currentLevel >= 2 ? 1 : 0,
      total: 1
    },
    {
      id: 'xp_100',
      title: '⭐ XP Collector',
      description: 'Earn 100 XP',
      earned: totalXP >= 100,
      progress: Math.min(totalXP, 100),
      total: 100
    },
    {
      id: 'xp_300',
      title: '💫 XP Champion',
      description: 'Earn 300 XP',
      earned: totalXP >= 300,
      progress: Math.min(totalXP, 300),
      total: 300
    },
    {
      id: 'level_3',
      title: '🚀 Halfway There',
      description: 'Reach Level 3',
      earned: currentLevel >= 3,
      progress: Math.min(currentLevel, 3),
      total: 3
    },
    {
      id: 'level_6',
      title: '🏆 Course Complete',
      description: 'Complete all 6 levels',
      earned: currentLevel >= 6,
      progress: Math.min(currentLevel, 6),
      total: 6
    }
  ];

  container.innerHTML = achievements.map(ach => {
    const opacity = ach.earned ? '1' : '0.5';
    const borderClass = ach.earned ? 'border-success' : 'border-secondary';
    const bgClass = ach.earned ? 'bg-light' : '';

    return `
      <div class="col-md-4 mb-3">
        <div class="card ${borderClass} ${bgClass}" style="opacity: ${opacity}">
          <div class="card-body text-center">
            <h3 class="mb-2">${ach.title}</h3>
            <p class="mb-2">${ach.description}</p>
            ${ach.earned
              ? '<span class="badge bg-success">✓ Earned!</span>'
              : `<small class="text-muted">Progress: ${ach.progress}/${ach.total}</small>`
            }
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Export for global use
window.loadStudentProgress = loadStudentProgress;
