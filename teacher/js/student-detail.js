// ===========================
// TEACHER - STUDENT DETAIL PAGE (Multi-Course Version)
// ===========================
// View individual student progress across all courses with accordion layout

// Import from shared modules
import { API_CONFIG } from '../../shared/js/constants.js';
import {
  getSession,
  requireLogin,
  requireRole
} from '../../shared/js/session.js';
import { formatRelativeTime, formatDateTime } from '../../shared/js/utils.js';

// Debug mode
const DEBUG_MODE = false;
function debugLog(...args) {
  if (DEBUG_MODE) console.log('[DEBUG]', ...args);
}

debugLog('✅ Script loaded successfully');
debugLog('✅ API_CONFIG:', API_CONFIG);
debugLog('✅ Functions loaded:', {
  getSession: typeof getSession,
  requireRole: typeof requireRole,
  formatRelativeTime: typeof formatRelativeTime
});

// ===========================
// STATE
// ===========================

let allCourses = [];
let studentData = null;
let studentEvents = [];

// ===========================
// INITIALIZATION
// ===========================

window.addEventListener('DOMContentLoaded', () => {
  debugLog('🔍 DOMContentLoaded fired');
  debugLog('🔍 Current URL:', window.location.href);
  debugLog('🔍 Session:', sessionStorage.getItem('userSession'));

  // Require login and teacher/admin role
  if (!requireRole(['teacher', 'admin'], '../index.html')) {
    debugLog('❌ Auth check failed - redirecting');
    return;
  }
  debugLog('✅ Auth check passed');

  // Get student ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');

  debugLog('🔍 Student ID from URL:', studentId);

  if (!studentId) {
    alert('No student ID provided');
    window.location.href = 'index.html';
    return;
  }

  // Load all data
  debugLog('📡 Starting to load data...');
  loadAllData(studentId);
});

// ===========================
// LOAD ALL DATA
// ===========================

async function loadAllData(studentId) {
  try {
    debugLog('📡 Fetching courses from:', `${API_CONFIG.baseURL}/courses`);
    debugLog('📡 Fetching student from:', `${API_CONFIG.baseURL}/students/${studentId}`);

    // Fetch courses and student data in parallel
    const [coursesResponse, studentResponse] = await Promise.all([
      fetch(`${API_CONFIG.baseURL}/courses`),
      fetch(`${API_CONFIG.baseURL}/students/${studentId}`)
    ]);

    debugLog('📡 Courses response status:', coursesResponse.status);
    debugLog('📡 Student response status:', studentResponse.status);

    if (!coursesResponse.ok || !studentResponse.ok) {
      throw new Error(`Failed to fetch data - Courses: ${coursesResponse.status}, Student: ${studentResponse.status}`);
    }

    const coursesData = await coursesResponse.json();
    const data = await studentResponse.json();

    debugLog('📡 Raw courses data:', coursesData);
    debugLog('📡 Raw student data:', data);

    // Extract courses array from response (API returns {courses: [...]})
    allCourses = coursesData.courses || coursesData;

    debugLog('✅ Courses loaded:', allCourses.length, 'courses');
    debugLog('✅ Student data loaded:', data.student.name);
    debugLog('✅ Events loaded:', data.all_events?.length || 0, 'events');

    studentData = data.student;
    studentEvents = data.all_events || [];

    // Display all sections
    debugLog('🎨 Rendering student header...');
    displayStudentHeader(data);

    debugLog('🎨 Rendering overall summary...');
    displayOverallSummary(data);

    debugLog('🎨 Rendering course accordion...');
    renderCourseAccordion();

    // Hide loading, show content
    debugLog('🎨 Hiding loading spinner, showing content...');
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('coursesAccordion').style.display = 'block';
    document.getElementById('actionButtons').style.display = 'block';

    debugLog('✅ ALL RENDERING COMPLETE!');

  } catch (error) {
    console.error('Error loading data:', error);
    alert('Failed to load student data');
    window.location.href = 'index.html';
  }
}

// ===========================
// DISPLAY STUDENT HEADER
// ===========================

function displayStudentHeader(data) {
  const student = data.student;

  // Top header
  document.getElementById('studentName').textContent = student.name || 'Unknown Student';
  document.getElementById('studentInfo').textContent =
    `${student.email || 'No email'} | Class: ${student.class_code || 'None'}`;

  // Summary card header
  document.getElementById('studentNameHeader').innerHTML =
    `👨‍🎓 ${student.name || 'Unknown Student'}`;
  document.getElementById('studentInfoHeader').innerHTML =
    `📧 ${student.email || 'No email'} | 🏫 Class: ${student.class_code || 'None'} | 🕒 Last Active: ${formatRelativeTime(student.last_active)}`;
}

// ===========================
// DISPLAY OVERALL SUMMARY
// ===========================

function displayOverallSummary(data) {
  const summary = data.summary || {};

  // Calculate rank based on badges
  const badges = summary.badges || 0;
  let rank = 'Beginner';
  if (badges >= 20) rank = 'Expert';
  else if (badges >= 10) rank = 'Advanced';
  else if (badges >= 5) rank = 'Intermediate';
  else if (badges >= 1) rank = 'Apprentice';

  document.getElementById('studentRank').textContent = `📚 ${rank}`;
  document.getElementById('overallProgress').textContent = `${summary.progress_percentage || 0}%`;
  document.getElementById('totalXP').textContent = `💎 ${summary.total_xp || 0}`;
  document.getElementById('totalBadges').textContent = `🥇 ${badges}/${allCourses.length * 6 + 1}`; // 6 per course + 1 beginner

  // Count completed courses (100% progress)
  const courseStats = calculateCourseStats();
  const completedCount = courseStats.filter(c => c.progress === 100).length;
  document.getElementById('completedCourses').textContent = `🎯 ${completedCount}/${allCourses.length}`;
}

// ===========================
// CALCULATE COURSE STATS
// ===========================

function calculateCourseStats() {
  return allCourses.map(course => {
    // Filter events for this course
    const courseEvents = studentEvents.filter(e => e.course_id === course.id);

    // Calculate steps completed
    const stepsCompleted = courseEvents.filter(e => e.event_type === 'step_checked').length;

    // Calculate quiz attempts
    const quizAttempts = courseEvents.filter(e => e.event_type === 'quiz_answered');
    const correctQuizzes = quizAttempts.filter(e => {
      try {
        const data = JSON.parse(e.data);
        return data.correct === true;
      } catch (err) {
        return false;
      }
    }).length;

    // ✅ FIX #1: Calculate XP from individual events (not level count)
    let courseXP = 0;

    // First, check for completion event with total_xp
    const completionEvent = courseEvents.find(e =>
      e.event_type === 'quest_completed' ||
      e.event_type === 'course_completed'
    );

    if (completionEvent) {
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

    const xpEarned = courseXP;

    // ✅ FIX #2: Count unique levels using Set (avoid duplicates)
    const uniqueLevels = new Set(
      courseEvents
        .filter(e => e.event_type === 'level_unlocked')
        .map(e => e.level)
    );
    let levelsCompleted = uniqueLevels.size;

    // ✅ FIX #3: Check for quest completion
    const questCompleted = courseEvents.some(e =>
      e.event_type === 'quest_completed' ||
      e.event_type === 'course_completed'
    );

    // Calculate progress percentage
    const totalLevels = course.total_levels || 6;
    let progress = 0;

    if (questCompleted) {
      progress = 100;  // Quest completed = 100%
      levelsCompleted = totalLevels;  // Show as fully completed
    } else {
      progress = totalLevels > 0 ? Math.round((levelsCompleted / totalLevels) * 100) : 0;
    }

    // Determine status
    let status = 'not-started';
    if (progress === 100) status = 'completed';
    else if (progress > 0) status = 'in-progress';

    // Calculate time spent (approximate based on events)
    let timeSpentMinutes = 0;
    if (courseEvents.length > 0) {
      const firstEvent = new Date(courseEvents[0].timestamp);
      const lastEvent = new Date(courseEvents[courseEvents.length - 1].timestamp);
      timeSpentMinutes = Math.round((lastEvent - firstEvent) / 60000) || 1;
    }

    // Get last activity
    let lastActive = 'Never';
    if (courseEvents.length > 0) {
      const lastEvent = courseEvents[courseEvents.length - 1];
      lastActive = formatRelativeTime(lastEvent.timestamp);
    }

    return {
      course,
      progress,
      status,
      levelsCompleted,
      totalLevels,
      stepsCompleted,
      xpEarned,
      timeSpentMinutes,
      quizAttempts: quizAttempts.length,
      correctQuizzes,
      quizScore: quizAttempts.length > 0 ? Math.round((correctQuizzes / quizAttempts.length) * 100) : 0,
      lastActive,
      events: courseEvents
    };
  });
}

// ===========================
// RENDER COURSE ACCORDION
// ===========================

function renderCourseAccordion() {
  const accordion = document.getElementById('coursesAccordion');
  const courseStats = calculateCourseStats();

  accordion.innerHTML = courseStats.map((stat, index) => {
    const isFirstCourse = index === 0;
    const collapseClass = isFirstCourse ? 'show' : '';
    const buttonClass = isFirstCourse ? '' : 'collapsed';

    return `
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button ${buttonClass}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${stat.course.id}">
            <span>${stat.course.icon || '📚'} ${stat.course.title}</span>
            ${renderCourseBadge(stat)}
          </button>
        </h2>
        <div id="collapse${stat.course.id}" class="accordion-collapse collapse ${collapseClass}" data-bs-parent="#coursesAccordion">
          <div class="accordion-body">
            ${renderCourseBody(stat)}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ===========================
// RENDER COURSE BADGE
// ===========================

function renderCourseBadge(stat) {
  if (stat.status === 'completed') {
    return `<span class="course-badge badge-completed">✅ 100% Complete</span>`;
  } else if (stat.status === 'in-progress') {
    return `<span class="course-badge badge-in-progress">⏳ ${stat.progress}% (${stat.levelsCompleted}/${stat.totalLevels} levels)</span>`;
  } else {
    return `<span class="course-badge badge-not-started">⚪ Not Started</span>`;
  }
}

// ===========================
// RENDER COURSE BODY
// ===========================

function renderCourseBody(stat) {
  if (stat.status === 'not-started') {
    return `
      <div class="alert alert-info">
        <strong>ℹ️ Not Started Yet</strong><br>
        This student hasn't begun this course. No activity to display.
      </div>
      ${renderMetricsGrid(stat)}
    `;
  }

  return `
    <div class="course-header-info">
      <div>
        <strong>Status:</strong> ${stat.status === 'completed' ? `Completed ${stat.lastActive}` : `In Progress (Last active: ${stat.lastActive})`}
      </div>
    </div>

    ${renderMetricsGrid(stat)}

    <div class="progress">
      <div class="progress-bar ${stat.status === 'completed' ? 'bg-success' : 'bg-warning'}" style="width: ${stat.progress}%; font-weight: bold;">
        ${stat.progress}%${stat.status !== 'completed' ? ` (${stat.levelsCompleted}/${stat.totalLevels})` : ''}
      </div>
    </div>

    ${renderLevelBreakdown(stat)}
  `;
}

// ===========================
// RENDER METRICS GRID
// ===========================

function renderMetricsGrid(stat) {
  return `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">${stat.levelsCompleted}/${stat.totalLevels}</div>
        <div class="metric-label">Levels</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${stat.xpEarned}</div>
        <div class="metric-label">XP Earned</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${stat.timeSpentMinutes}m</div>
        <div class="metric-label">Time Spent</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${stat.quizAttempts > 0 ? stat.quizScore + '%' : '—'}</div>
        <div class="metric-label">Quiz Score</div>
      </div>
    </div>
  `;
}

// ===========================
// RENDER LEVEL BREAKDOWN
// ===========================

function renderLevelBreakdown(stat) {
  if (stat.levelsCompleted === 0) {
    return '<h6 class="mt-3">No levels completed yet</h6>';
  }

  // Group events by level
  const eventsByLevel = {};
  stat.events.forEach(event => {
    const level = event.level || 0;
    if (!eventsByLevel[level]) {
      eventsByLevel[level] = {
        steps: [],
        quizzes: []
      };
    }

    if (event.event_type === 'step_checked') {
      try {
        const data = JSON.parse(event.data);
        if (data.step) eventsByLevel[level].steps.push(data.step);
      } catch (err) {}
    } else if (event.event_type === 'quiz_answered') {
      try {
        const data = JSON.parse(event.data);
        eventsByLevel[level].quizzes.push(data.correct);
      } catch (err) {}
    }
  });

  const levels = Object.keys(eventsByLevel).sort((a, b) => a - b);

  return `
    <h6 class="mt-3">Level Breakdown:</h6>
    <div class="levels-list">
      ${levels.map(level => {
        const levelData = eventsByLevel[level];
        const stepsCount = levelData.steps.length;
        const quizzesCount = levelData.quizzes.length;
        const correctQuizzes = levelData.quizzes.filter(q => q).length;
        const quizScore = quizzesCount > 0 ? Math.round((correctQuizzes / quizzesCount) * 100) : 0;

        // Determine if level is completed (has both steps and quiz)
        const isCompleted = stepsCount > 0 && quizzesCount > 0;
        const statusClass = isCompleted ? 'completed' : 'in-progress';

        return `
          <div class="level-row ${statusClass}">
            <div style="flex: 1;">
              <strong>Level ${level}:</strong> ${getLevelTitle(stat.course.title, level)}
              <small class="d-block text-muted">
                ${stepsCount} step${stepsCount !== 1 ? 's' : ''} |
                ${quizzesCount > 0 ? `Quiz: ${quizScore}% (${correctQuizzes}/${quizzesCount})` : 'No quiz'}
              </small>
            </div>
            <span class="badge ${isCompleted ? 'bg-success' : 'bg-warning'}">${isCompleted ? '✓' : '⏳'}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ===========================
// GET LEVEL TITLE
// ===========================

function getLevelTitle(courseTitle, levelNum) {
  // Generic level titles (can be customized per course later)
  const titles = {
    1: 'Introduction',
    2: 'Getting Started',
    3: 'Core Concepts',
    4: 'Advanced Techniques',
    5: 'Practice & Application',
    6: 'Final Challenge'
  };

  return titles[levelNum] || `Level ${levelNum}`;
}
