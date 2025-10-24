// ===========================
// STUDENT DASHBOARD
// ===========================
// Student dashboard logic with shared module imports

// Import from shared modules
import { API_CONFIG } from '../../shared/js/constants.js';
import {
  getSession,
  requireLogin,
  updateLastActive,
  saveLastCourse,
  clearSession
} from '../../shared/js/session.js';
import { getStudent, getCourses } from '../../shared/js/api-client.js';
import {
  formatRelativeTime,
  calculateRank
} from '../../shared/js/utils.js';

// ===========================
// STATE
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

  // Only students can access this dashboard
  if (session.role !== 'student') {
    alert('⚠️ This page is for students only.');
    window.location.href = '../index.html';
    return;
  }

  currentStudent = session;

  // Update header
  updateDashboardHeader();

  // Load student progress
  await loadStudentProgress();

  // Load courses
  await loadCourses();

  // Setup logout button
  setupLogoutButton();
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
    const data = await getStudent(currentStudent.id);
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

  // NEW (v2.0): Update badges (1 badge per course completed, max 30)
  const badges = summary.badges || 0;
  document.getElementById('badgesEarned').textContent = `${badges}/30`;

  // NEW (v2.0): Update rank (course-based progression)
  const rankName = summary.rankName || 'Beginner';
  const rankIcon = summary.rankIcon || '🎯';
  document.getElementById('currentRank').textContent = `${rankIcon} ${rankName}`;

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
  try {
    // Fetch courses from API
    const data = await getCourses();

    // Store courses and sort by display_order
    availableCourses = data.courses.sort((a, b) => a.display_order - b.display_order);

    // Render courses
    renderCourses();

  } catch (error) {
    console.error('Error loading courses:', error);

    // Show error message
    const container = document.getElementById('coursesContainer');
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger">
          ❌ Failed to load courses. Make sure the backend server is running.
        </div>
      `;
    }
  }
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

  // Calculate overall progress by averaging all course completions
  const courseProgressValues = [];

  container.innerHTML = availableCourses.map(course => {
    // Extract icon (first emoji) from title
    const iconMatch = course.title.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
    const icon = iconMatch ? iconMatch[0] : '📚';

    // Get unlock_requirements (already parsed by backend)
    let requirements = course.unlock_requirements || null;

    // Determine if course is unlocked
    let isUnlocked = !requirements; // No requirements = always unlocked
    let canUnlock = true;
    let unmetRequirements = [];

    if (requirements) {
      // Check if requirements are met
      if (requirements.min_xp && (summary.total_xp || 0) < requirements.min_xp) {
        canUnlock = false;
        unmetRequirements.push(`Earn ${requirements.min_xp} XP (Current: ${summary.total_xp || 0} XP)`);
      }

      if (requirements.min_progress && (summary.progress_percentage || 0) < requirements.min_progress) {
        canUnlock = false;
        unmetRequirements.push(`Complete ${requirements.min_progress}% of Course ${requirements.course_id}`);
      }

      isUnlocked = canUnlock;
    }

    // Course progress - CALCULATE PER-COURSE METRICS
    let courseProgress = 0;
    let currentLevel = 0;
    let xpEarned = 0;
    let timeSpent = 'Not started';
    let lastActive = 'Never';

    if ((course.id === 1 || course.id === 4) && studentProgress) {
      // STEP 1: Filter events for THIS course only
      // Now that backend saves course_id correctly, we can use simple filtering
      const courseEvents = studentProgress.all_events
        ? studentProgress.all_events.filter(e => e.course_id === course.id)
        : [];

      // STEP 2: Calculate course-specific XP
      let courseXP = 0;

      // First, check if there's a completion event with total_xp
      const completionEvent = courseEvents.find(e =>
        e.event_type === 'quest_completed' ||
        e.event_type === 'course_completed'
      );

      if (completionEvent) {
        // Use total XP from completion event (most accurate)
        try {
          const data = typeof completionEvent.data === 'string'
            ? JSON.parse(completionEvent.data)
            : completionEvent.data;
          if (data.total_xp) {
            courseXP = data.total_xp;
          }
        } catch {}
      }

      // If no completion event or no total_xp, calculate from individual events
      if (courseXP === 0) {
        courseEvents.forEach(e => {
          if (e.event_type === 'step_checked') {
            courseXP += 20; // 20 XP per step
          } else if (e.event_type === 'quiz_answered') {
            try {
              const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
              if (data.correct === true) {
                courseXP += 100; // 100 XP per correct quiz
              }
            } catch {}
          }
        });
      }

      xpEarned = courseXP;

      // STEP 3: Calculate course-specific time spent
      const progressEvents = courseEvents.filter(e =>
        e.event_type === 'step_checked' ||
        e.event_type === 'quiz_answered' ||
        e.event_type === 'level_unlocked'
      );

      if (progressEvents.length > 0) {
        // Estimate: ~2 minutes per progress event
        const totalMinutes = progressEvents.length * 2;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        timeSpent = `${hours}h ${minutes}m`;
      } else {
        timeSpent = 'Not started';
      }

      // STEP 4: Calculate course-specific last active
      if (courseEvents.length > 0) {
        // Get most recent timestamp for THIS course
        const timestamps = courseEvents.map(e => new Date(e.timestamp));
        const mostRecent = new Date(Math.max(...timestamps));
        lastActive = formatRelativeTime(mostRecent.toISOString());
      } else {
        lastActive = 'Never';
      }

      // STEP 5: Calculate course-specific levels/progress
      const levelsUnlocked = new Set(
        courseEvents
          .filter(e => e.event_type === 'level_unlocked')
          .map(e => e.level)
      );
      currentLevel = levelsUnlocked.size;

      // Check for course completion
      const questCompleted = courseEvents.some(e =>
        e.event_type === 'quest_completed' ||
        e.event_type === 'course_completed'
      );

      if (questCompleted) {
        courseProgress = 100;
        currentLevel = course.total_levels; // Show as fully completed
      } else {
        courseProgress = Math.round((currentLevel / course.total_levels) * 100);
      }
    }

    // Track this course's progress for overall calculation
    courseProgressValues.push(courseProgress);

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
            <h4 class="course-title">${course.title}</h4>
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
            <button class="btn btn-primary btn-lg" onclick="window.startCourse('${course.url}', ${course.id})">
              ▶ ${courseProgress > 0 ? 'Continue Learning' : 'Start Course'}
            </button>
            ${courseProgress > 0 ? `
              <button class="btn btn-outline-primary" onclick="window.viewCourseProgress(${course.id})">
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

  // Calculate and update overall progress (average of all courses)
  if (courseProgressValues.length > 0) {
    const overallProgress = Math.round(
      courseProgressValues.reduce((sum, val) => sum + val, 0) / courseProgressValues.length
    );

    // Update overall progress display in dashboard header
    document.getElementById('overallProgressText').textContent = `${overallProgress}%`;
    document.getElementById('overallProgressBar').style.width = `${overallProgress}%`;
    document.getElementById('overallProgressBar').textContent = `${overallProgress}%`;
  }
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

  // Redirect to course (add ../ since dashboard is in /student/ folder)
  window.location.href = '../' + courseUrl;
}

function viewCourseProgress(courseId) {
  // Redirect to student progress page (secure, no URL parameters)
  if (courseId === 1 && currentStudent) {
    window.location.href = 'progress.html';
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
    window.location.href = `../admin/index.html?class=${currentStudent.class_code}`;
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
// EXPORT TO WINDOW (for onclick handlers)
// ===========================

window.startCourse = startCourse;
window.viewCourseProgress = viewCourseProgress;
window.viewAllBadges = viewAllBadges;
window.viewLeaderboard = viewLeaderboard;
window.viewMyClass = viewMyClass;
window.getHelp = getHelp;
window.openSettings = openSettings;

// ===========================
// INITIALIZE ON LOAD
// ===========================

window.addEventListener('DOMContentLoaded', () => {
  initializeDashboard();
});
