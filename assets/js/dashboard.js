// ===========================
// DASHBOARD LOGIC
// ===========================

let currentStudent = null;
let studentProgress = null;
let availableCourses = [];

// ===========================
// INITIALIZE DASHBOARD
// ===========================

async function initializeDashboard() {
  // Check if user is logged in
  if (!requireLogin()) return;

  // Get current session
  const session = getSession();
  currentStudent = session;

  // Update header
  updateDashboardHeader();

  // Load student progress
  await loadStudentProgress();

  // Load courses
  await loadCourses();
}

// ===========================
// UPDATE HEADER
// ===========================

function updateDashboardHeader() {
  if (!currentStudent) return;

  document.getElementById('studentNameHeader').textContent = currentStudent.name;
}

// ===========================
// LOAD STUDENT PROGRESS
// ===========================

async function loadStudentProgress() {
  if (!currentStudent) return;

  try {
    const response = await fetch(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.student}${currentStudent.id}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch student progress');
    }

    const data = await response.json();
    studentProgress = data;

    // Update dashboard with student data
    updateStudentSummary(data);

  } catch (error) {
    console.error('Error loading student progress:', error);
    // Use defaults if API fails
    updateStudentSummary({
      summary: {
        current_level: 0,
        progress_percentage: 0,
        total_xp: 0,
        steps_completed: 0
      }
    });
  }
}

// ===========================
// UPDATE STUDENT SUMMARY
// ===========================

function updateStudentSummary(data) {
  const summary = data.summary || {};

  // Update header stats
  document.getElementById('userLevel').textContent = `Level ${summary.current_level || 0}`;
  document.getElementById('userXP').textContent = `${summary.total_xp || 0} XP`;

  // Update overall progress
  const progressPercent = summary.progress_percentage || 0;
  document.getElementById('overallProgressText').textContent = `${progressPercent}%`;
  document.getElementById('overallProgressBar').style.width = `${progressPercent}%`;
  document.getElementById('overallProgressBar').textContent = `${progressPercent}%`;

  // Update stat badges
  document.getElementById('totalXPBadge').textContent = summary.total_xp || 0;

  // Calculate badges (1 badge per 100 XP, max 12)
  const badgesEarned = Math.min(Math.floor((summary.total_xp || 0) / 100), 12);
  document.getElementById('badgesEarned').textContent = `${badgesEarned}/12`;

  // Update rank
  const rank = calculateRank(summary.total_xp || 0);
  document.getElementById('currentRank').textContent = rank;

  // Update class info
  document.getElementById('classCodeDisplay').textContent = currentStudent.class_code || 'None';
  document.getElementById('emailDisplay').textContent = currentStudent.email || 'No email';
  document.getElementById('lastActiveDisplay').textContent =
    formatRelativeTime(currentStudent.last_active);
}

// ===========================
// LOAD COURSES
// ===========================

async function loadCourses() {
  // For now, use hardcoded courses
  // Later, this will fetch from API
  availableCourses = [
    {
      id: 1,
      title: '🎯 Course 1: Studio Basics',
      description: 'Game-Style Interactive Tutorial',
      url: 'versions/v9_game_style.html',
      status: 'active',
      requirements: null,
      total_levels: 6,
      icon: '🎮'
    },
    {
      id: 2,
      title: '🔒 Course 2: Advanced Scripting',
      description: 'Lua Programming Deep-Dive',
      url: 'versions/v10_advanced.html',
      status: 'locked',
      requirements: {
        course_id: 1,
        min_xp: 300,
        min_progress: 80
      },
      total_levels: 8,
      icon: '💻'
    },
    {
      id: 3,
      title: '🔒 Course 3: Multiplayer Games',
      description: 'Building Multi-Player Experiences',
      url: 'versions/v11_multiplayer.html',
      status: 'locked',
      requirements: {
        course_id: 2,
        min_xp: 600,
        min_progress: 80
      },
      total_levels: 10,
      icon: '👥'
    }
  ];

  // Render courses
  renderCourses();
}

// ===========================
// RENDER COURSES
// ===========================

function renderCourses() {
  const container = document.getElementById('coursesContainer');

  if (!studentProgress) {
    container.innerHTML = '<p class="text-center text-muted">Loading courses...</p>';
    return;
  }

  const summary = studentProgress.summary || {};

  container.innerHTML = availableCourses.map(course => {
    // Determine if course is unlocked
    let isUnlocked = course.status === 'active';
    let canUnlock = true;
    let unmetRequirements = [];

    if (course.requirements) {
      // Check if requirements are met
      if (course.requirements.min_xp && (summary.total_xp || 0) < course.requirements.min_xp) {
        canUnlock = false;
        unmetRequirements.push(`Earn ${course.requirements.min_xp} XP (Current: ${summary.total_xp || 0} XP)`);
      }

      if (course.requirements.min_progress && (summary.progress_percentage || 0) < course.requirements.min_progress) {
        canUnlock = false;
        unmetRequirements.push(`Complete ${course.requirements.min_progress}% of Course ${course.requirements.course_id}`);
      }

      isUnlocked = canUnlock;
    }

    // Course progress (for Course 1, use actual progress)
    let courseProgress = 0;
    let currentLevel = 0;
    let xpEarned = 0;
    let timeSpent = 'Not started';
    let lastActive = 'Never';

    if (course.id === 1 && studentProgress) {
      courseProgress = summary.progress_percentage || 0;
      currentLevel = summary.current_level || 0;
      xpEarned = summary.total_xp || 0;

      if (studentProgress.student && studentProgress.student.last_active) {
        lastActive = formatRelativeTime(studentProgress.student.last_active);
      }

      // Calculate time spent - only count meaningful progress events
      const progressEvents = studentProgress.all_events
        ? studentProgress.all_events.filter(e =>
            e.event_type === 'step_checked' ||
            e.event_type === 'quiz_answered' ||
            e.event_type === 'level_unlocked'
          )
        : [];

      if (progressEvents.length > 0) {
        // Estimate: ~2 minutes per progress event
        const totalMinutes = progressEvents.length * 2;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        timeSpent = `${hours}h ${minutes}m`;
      } else {
        timeSpent = 'Not started';
      }
    }

    // Status badge
    let statusBadge = '';
    let statusClass = '';

    if (isUnlocked) {
      if (courseProgress > 0) {
        statusBadge = '📍 YOUR CURRENT COURSE';
        statusClass = 'status-active';
      } else {
        statusBadge = '✅ UNLOCKED';
        statusClass = 'status-active';
      }
    } else {
      statusBadge = '🔒 LOCKED';
      statusClass = 'status-locked';
    }

    // Render course card
    return `
      <div class="course-card ${isUnlocked ? 'active' : 'locked'}">
        <div class="course-header">
          <div>
            <h4 class="course-title">${course.icon} ${course.title.replace(/^🎯 |^🔒 /, '')}</h4>
            <p class="course-description">${course.description}</p>
          </div>
          <span class="course-status-badge ${statusClass}">${statusBadge}</span>
        </div>

        ${isUnlocked && courseProgress > 0 ? `
          <div class="course-progress">
            <div class="d-flex justify-content-between mb-2">
              <span>Progress</span>
              <span><strong>${courseProgress}%</strong> (Level ${currentLevel}/${course.total_levels})</span>
            </div>
            <div class="progress">
              <div class="progress-bar" role="progressbar" style="width: ${courseProgress}%">
                ${courseProgress}%
              </div>
            </div>
          </div>
        ` : ''}

        ${isUnlocked ? `
          <div class="course-stats">
            <div class="course-stat">
              <div class="course-stat-value">${currentLevel}/${course.total_levels}</div>
              <div class="course-stat-label">Levels</div>
            </div>
            <div class="course-stat">
              <div class="course-stat-value">${xpEarned}</div>
              <div class="course-stat-label">XP Earned</div>
            </div>
            <div class="course-stat">
              <div class="course-stat-value">${timeSpent}</div>
              <div class="course-stat-label">Time Spent</div>
            </div>
            <div class="course-stat">
              <div class="course-stat-value">${lastActive}</div>
              <div class="course-stat-label">Last Active</div>
            </div>
          </div>

          <div class="course-actions">
            <button class="btn btn-primary btn-lg" onclick="startCourse('${course.url}', ${course.id})">
              ▶ ${courseProgress > 0 ? 'Continue Learning' : 'Start Course'}
            </button>
            ${courseProgress > 0 ? `
              <button class="btn btn-outline-primary" onclick="viewCourseProgress(${course.id})">
                📊 View My Progress
              </button>
            ` : ''}
          </div>
        ` : `
          <div class="lock-requirements">
            <h6>🔐 Unlock Requirements:</h6>
            <ul>
              ${unmetRequirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
          </div>

          <div class="course-actions">
            <button class="btn btn-secondary btn-lg" disabled>
              🔒 Locked
            </button>
          </div>
        `}
      </div>
    `;
  }).join('');
}

// ===========================
// COURSE ACTIONS
// ===========================

function startCourse(courseUrl, courseId) {
  // Update last active
  updateLastActive();

  // Save last course
  saveLastCourse(courseUrl);

  // Update session with current course
  const session = getSession();
  if (session) {
    session.current_course_id = courseId;
    localStorage.setItem('studentSession', JSON.stringify(session));
  }

  // Redirect to course
  window.location.href = courseUrl;
}

function viewCourseProgress(courseId) {
  // For Course 1, redirect to admin student detail page
  if (courseId === 1 && currentStudent) {
    window.location.href = `admin/student-detail.html?id=${currentStudent.id}`;
  }
}

// ===========================
// QUICK ACTIONS
// ===========================

function viewAllBadges() {
  alert('View All Badges feature coming soon!');
}

function viewLeaderboard() {
  alert('Class Leaderboard feature coming soon!');
}

function viewMyClass() {
  if (currentStudent && currentStudent.class_code) {
    // Redirect to admin dashboard filtered by class
    window.location.href = `admin/index.html?class=${currentStudent.class_code}`;
  } else {
    alert('No class code assigned to your account.');
  }
}

function getHelp() {
  alert('Help Center:\n\n' +
    '1. Complete tutorials step-by-step\n' +
    '2. Check off each step as you complete it\n' +
    '3. Answer quiz questions to earn XP\n' +
    '4. Unlock new levels as you progress\n' +
    '5. Ask your teacher if you need assistance\n\n' +
    'Email: support@robloxacademy.com');
}

function openSettings() {
  alert('Settings:\n\n' +
    `Name: ${currentStudent.name}\n` +
    `Email: ${currentStudent.email}\n` +
    `Class: ${currentStudent.class_code}\n\n` +
    'To change your settings, please contact your teacher.');
}

// Export functions for global use
window.initializeDashboard = initializeDashboard;
window.startCourse = startCourse;
window.viewCourseProgress = viewCourseProgress;
window.viewAllBadges = viewAllBadges;
window.viewLeaderboard = viewLeaderboard;
window.viewMyClass = viewMyClass;
window.getHelp = getHelp;
window.openSettings = openSettings;
