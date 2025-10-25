// ===========================
// BADGE GALLERY PAGE
// ===========================
// Student Badge Collection & Achievement Tracking

// Import from shared modules
import { getRankInfo } from '../../shared/js/utils.js';
import { getStudent } from '../../shared/js/api-client.js';
import { getSession, requireLogin, updateLastActive } from '../../shared/js/session.js';

// ===========================
// STATE
// ===========================

let currentStudent = null;
let studentProgress = null;

// ===========================
// INITIALIZE PAGE
// ===========================

async function initializeBadgesPage() {
  // Check authentication
  if (!requireLogin()) return;

  const session = getSession();

  // Only students can access this page
  if (session.role !== 'student') {
    alert('⚠️ This page is for students only.');
    window.location.href = '../index.html';
    return;
  }

  currentStudent = session;

  // Update last active
  updateLastActive();

  // Fetch student data
  try {
    studentProgress = await getStudent(currentStudent.id);

    // Render badges gallery
    renderBadgesGallery(studentProgress);

    // Update header stats
    updateHeaderStats(studentProgress);
  } catch (error) {
    console.error('Error loading badge data:', error);
    showError();
  }
}

// ===========================
// RENDER BADGES GALLERY
// ===========================

function renderBadgesGallery(studentData) {
  const badgesEarned = studentData.summary.badges || 0;
  const grid = document.getElementById('badgesGrid');

  // Get all 31 ranks (0-30)
  const allRanks = [];
  for (let i = 0; i <= 30; i++) {
    const rank = getRankInfo(i);
    rank.isEarned = i <= badgesEarned;
    rank.coursesRequired = i;
    allRanks.push(rank);
  }

  // Render each badge card
  grid.innerHTML = allRanks.map(rank => createBadgeCard(rank)).join('');
}

// ===========================
// CREATE BADGE CARD
// ===========================

function createBadgeCard(rank) {
  const statusClass = rank.isEarned ? 'earned' : 'locked';
  const iconClass = rank.isEarned ? '' : 'grayscale';
  const statusText = rank.isEarned ? '✅ Earned!' : '🔒 Locked';
  const statusBadgeClass = rank.isEarned ? 'earned-badge' : 'locked-badge';

  return `
    <div class="badge-card ${statusClass}" data-level="${rank.level}">
      <div class="badge-icon ${iconClass}">${rank.icon}</div>
      <div class="badge-info">
        <h3 class="badge-name">${rank.name}</h3>
        <p class="badge-level">Level ${rank.level}</p>
        <p class="badge-requirement">
          ${rank.coursesRequired === 0 ? 'Starting rank' :
            rank.coursesRequired === 1 ? 'Complete 1 course' :
            `Complete ${rank.coursesRequired} courses`}
        </p>
        <span class="badge-status ${statusBadgeClass}">${statusText}</span>
      </div>
    </div>
  `;
}

// ===========================
// UPDATE HEADER STATS
// ===========================

function updateHeaderStats(studentData) {
  const badges = studentData.summary.badges || 0;
  const currentRank = getRankInfo(badges);
  const nextRank = getRankInfo(badges + 1);

  // Update earned count (add 1 to include Beginner badge)
  document.getElementById('badgesEarned').textContent = badges + 1;

  // Update current rank
  document.getElementById('currentRankIcon').textContent = currentRank.icon;
  document.getElementById('currentRankName').textContent = currentRank.name;

  // Update next badge
  if (badges < 30) {
    document.getElementById('nextBadgeName').textContent = nextRank.name;
    document.getElementById('nextBadgeIcon').textContent = nextRank.icon;
    document.getElementById('coursesNeeded').textContent = 1;
    document.getElementById('nextBadge').textContent = nextRank.name;
    document.getElementById('nextBadgeIconText').textContent = nextRank.icon;

    // Progress bar (always 0% until next course completed)
    // In future: could calculate mid-course progress
    const progressPercent = 0;
    const progressBar = document.getElementById('progressToNext');
    progressBar.style.width = `${progressPercent}%`;
    progressBar.textContent = progressPercent === 0 ? 'Start your next course!' : `${progressPercent}%`;
  } else {
    // Max rank reached
    const nextBadgeSection = document.querySelector('.next-badge');
    nextBadgeSection.innerHTML = '<span class="max-rank">🏆 Maximum Rank Achieved!</span>';

    const progressBar = document.getElementById('progressToNext');
    progressBar.style.width = '100%';
    progressBar.textContent = '100% Complete!';
    progressBar.style.background = 'linear-gradient(90deg, #ffd700, #ffed4e)';

    document.getElementById('progressText').innerHTML =
      '<strong>Congratulations! You have earned all 31 badges! 🎉</strong>';
  }
}

// ===========================
// ERROR HANDLING
// ===========================

function showError() {
  const grid = document.getElementById('badgesGrid');
  grid.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="alert alert-danger">
        <h4>❌ Failed to Load Badges</h4>
        <p>Could not fetch your badge data. Please make sure the backend server is running.</p>
        <button class="btn btn-primary mt-3" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </div>
  `;
}

// ===========================
// INITIALIZE ON LOAD
// ===========================

window.addEventListener('DOMContentLoaded', () => {
  initializeBadgesPage();
});
