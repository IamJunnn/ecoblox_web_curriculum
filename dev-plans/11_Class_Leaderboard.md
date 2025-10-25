# 11 - Class Leaderboard (Competitive Rankings)

**Feature**: Class-based Leaderboard with Multiple Ranking Metrics
**Priority**: Phase 2 Enhancement
**Difficulty**: Medium-High
**Time Estimate**: 6-8 hours

---

## Overview

Create a competitive leaderboard system that shows student rankings within their class based on XP, badges earned, course completion percentage, and current rank. Students can see their position relative to classmates, fostering healthy competition and motivation.

**User Story**: *"As a student, I want to see how I rank compared to my classmates so I can stay motivated and compete in a fun, educational way."*

---

## Current Status

### ✅ Already Implemented
- Class code system (students.class_code field)
- XP tracking per student
- Badge/rank calculation
- Course completion tracking
- Student summary statistics

### ❌ Not Yet Implemented
- Leaderboard API endpoint
- Leaderboard frontend page
- Ranking algorithms
- Class filtering
- Multiple sorting options (XP, badges, completion %)
- Student position highlighting

---

## Database Requirements

### No New Tables Required ✅

All data available from existing tables:
- `students` table - student info, class_code
- `progress_events` table - progress tracking
- Existing API can be enhanced

### New API Endpoint Required

**Endpoint**: `GET /api/leaderboard/:class_code`

**Purpose**: Get ranked list of students in a specific class

**Query Parameters**:
```
?sortBy=xp          (default: xp)
?sortBy=badges      (sort by badge count)
?sortBy=completion  (sort by completion %)
?sortBy=rank        (sort by rank level)
```

**Response Example**:
```json
{
  "class_code": "CS2025",
  "total_students": 25,
  "leaderboard": [
    {
      "rank": 1,
      "student_id": 5,
      "name": "Alice Johnson",
      "total_xp": 2500,
      "badges": 25,
      "completion_percentage": 83,
      "current_rank": "Genius",
      "rank_icon": "🧠",
      "rank_level": 26,
      "courses_completed": 25
    },
    {
      "rank": 2,
      "student_id": 8,
      "name": "Bob Smith",
      "total_xp": 2200,
      "badges": 22,
      "completion_percentage": 73,
      "current_rank": "Sage",
      "rank_icon": "🧙",
      "rank_level": 22,
      "courses_completed": 22
    },
    ...
  ],
  "your_rank": {
    "position": 5,
    "student": { ... }
  }
}
```

---

## Backend Implementation

### Step 1: Add Leaderboard Endpoint (backend/routes.js)

```javascript
// ===========================
// GET LEADERBOARD BY CLASS
// ===========================
/**
 * GET /api/leaderboard/:class_code
 *
 * Get ranked leaderboard for a specific class
 * Query params: ?sortBy=xp|badges|completion|rank
 */
app.get('/api/leaderboard/:class_code', (req, res) => {
  const { class_code } = req.params;
  const sortBy = req.query.sortBy || 'xp'; // default sort by XP
  const studentId = req.query.student_id; // optional: highlight specific student

  // Get all students in this class
  db.all(
    `SELECT * FROM students WHERE class_code = ? AND role = 'student'`,
    [class_code],
    (err, students) => {
      if (err) {
        console.error('Error fetching class students:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!students || students.length === 0) {
        return res.json({
          class_code,
          total_students: 0,
          leaderboard: [],
          your_rank: null
        });
      }

      // Calculate stats for each student
      let studentsWithStats = [];
      let completed = 0;

      students.forEach(student => {
        db.all(
          `SELECT * FROM progress_events WHERE student_id = ?`,
          [student.id],
          (err, events) => {
            if (err) {
              console.error('Error fetching events:', err);
              return;
            }

            // Calculate badges and rank
            const { badges, rankLevel, rankName, rankIcon } =
              calculateBadgesAndRank(events || []);

            // Calculate completion percentage
            const totalCourses = 30;
            const coursesCompleted = badges; // 1 course = 1 badge
            const completionPercentage = Math.round((coursesCompleted / totalCourses) * 100);

            // Calculate total XP
            let totalXP = 0;
            (events || []).forEach(e => {
              if (e.event_type === 'step_checked') totalXP += 20;
              if (e.event_type === 'quiz_answered') {
                try {
                  const data = JSON.parse(e.data);
                  if (data.correct) totalXP += 100;
                } catch {}
              }
            });

            studentsWithStats.push({
              student_id: student.id,
              name: student.name,
              total_xp: totalXP,
              badges: badges,
              completion_percentage: completionPercentage,
              current_rank: rankName,
              rank_icon: rankIcon,
              rank_level: rankLevel,
              courses_completed: coursesCompleted
            });

            completed++;

            // When all students processed
            if (completed === students.length) {
              // Sort based on sortBy parameter
              studentsWithStats.sort((a, b) => {
                switch (sortBy) {
                  case 'badges':
                    return b.badges - a.badges || b.total_xp - a.total_xp;
                  case 'completion':
                    return b.completion_percentage - a.completion_percentage || b.total_xp - a.total_xp;
                  case 'rank':
                    return b.rank_level - a.rank_level || b.total_xp - a.total_xp;
                  case 'xp':
                  default:
                    return b.total_xp - a.total_xp;
                }
              });

              // Add rank positions
              const leaderboard = studentsWithStats.map((student, index) => ({
                rank: index + 1,
                ...student
              }));

              // Find current student's rank if provided
              let yourRank = null;
              if (studentId) {
                const yourPosition = leaderboard.find(s => s.student_id === parseInt(studentId));
                if (yourPosition) {
                  yourRank = {
                    position: yourPosition.rank,
                    student: yourPosition
                  };
                }
              }

              res.json({
                class_code,
                total_students: students.length,
                sort_by: sortBy,
                leaderboard,
                your_rank: yourRank
              });
            }
          }
        );
      });
    }
  );
});
```

### Step 2: Helper Function (if not exists)

```javascript
/**
 * Calculate badges and rank from events
 */
function calculateBadgesAndRank(events) {
  const completedCourses = new Set();

  events.forEach(event => {
    if (event.event_type === 'course_completed' ||
        event.event_type === 'quest_completed') {
      try {
        const data = typeof event.data === 'string' ?
          JSON.parse(event.data) : event.data;
        const courseId = data.course_id || event.course_id;
        if (courseId) {
          completedCourses.add(courseId);
        }
      } catch (error) {
        console.error('Error parsing completion event:', error);
      }
    }
  });

  const badges = completedCourses.size;
  const rankInfo = getRankInfo(badges);

  return {
    badges,
    rankLevel: rankInfo.level,
    rankName: rankInfo.name,
    rankIcon: rankInfo.icon
  };
}
```

---

## Frontend Implementation

### File Structure
```
student/
├── leaderboard.html .............. NEW (Leaderboard Page)
└── js/
    └── leaderboard.js ............ NEW (Leaderboard Logic)
```

### Page Design (leaderboard.html)

#### Header Section
```html
<header class="leaderboard-header">
  <h1>🏆 Class Leaderboard</h1>
  <div class="class-info">
    <span class="class-badge" id="className">CS2025</span>
    <span class="student-count"><span id="studentCount">25</span> Students</span>
  </div>
  <a href="dashboard.html" class="back-button">← Back to Dashboard</a>
</header>
```

#### Sorting Options
```html
<div class="sort-options">
  <h3>Sort By:</h3>
  <div class="button-group">
    <button class="sort-btn active" data-sort="xp">
      ⭐ XP Points
    </button>
    <button class="sort-btn" data-sort="badges">
      🏆 Badges Earned
    </button>
    <button class="sort-btn" data-sort="completion">
      📊 Completion %
    </button>
    <button class="sort-btn" data-sort="rank">
      👑 Rank Level
    </button>
  </div>
</div>
```

#### Your Position Card (Highlighted)
```html
<div class="your-position-card" id="yourPosition">
  <h2>Your Position</h2>
  <div class="position-details">
    <div class="rank-number">#5</div>
    <div class="position-stats">
      <p><strong>XP:</strong> 1500</p>
      <p><strong>Badges:</strong> 15/30</p>
      <p><strong>Rank:</strong> Master 🏆</p>
    </div>
  </div>
</div>
```

#### Leaderboard Table
```html
<div class="leaderboard-container">
  <table class="leaderboard-table" id="leaderboardTable">
    <thead>
      <tr>
        <th>Rank</th>
        <th>Student</th>
        <th>XP</th>
        <th>Badges</th>
        <th>Completion</th>
        <th>Current Rank</th>
      </tr>
    </thead>
    <tbody id="leaderboardBody">
      <!-- Generated dynamically -->
    </tbody>
  </table>
</div>
```

#### Leaderboard Row Template
```html
<tr class="leaderboard-row" data-student-id="5">
  <td class="rank-cell">
    <span class="rank-medal">🥇</span>
    <span class="rank-number">1</span>
  </td>
  <td class="name-cell">Alice Johnson</td>
  <td class="xp-cell">2500 XP</td>
  <td class="badges-cell">25/30</td>
  <td class="completion-cell">
    <div class="progress-mini">
      <div class="progress-bar-mini" style="width: 83%;">83%</div>
    </div>
  </td>
  <td class="rank-cell">🧠 Genius</td>
</tr>

<!-- Highlighted row for current student -->
<tr class="leaderboard-row your-row" data-student-id="12">
  ...
</tr>
```

---

## JavaScript Implementation (leaderboard.js)

### Core Functions

#### 1. Initialize Leaderboard
```javascript
import { getSession, requireLogin } from '../../shared/js/session.js';
import { API_CONFIG } from '../../shared/js/constants.js';

let currentSort = 'xp';
let currentStudent = null;

async function initializeLeaderboard() {
  // Check authentication
  if (!requireLogin()) return;

  const session = getSession();
  currentStudent = session;

  // Get class code
  const classCode = session.class_code;
  if (!classCode) {
    alert('You are not assigned to a class yet.');
    window.location.href = 'dashboard.html';
    return;
  }

  // Update header
  document.getElementById('className').textContent = classCode;

  // Load leaderboard
  await loadLeaderboard(classCode, currentSort);

  // Setup sort buttons
  setupSortButtons();
}
```

#### 2. Fetch Leaderboard Data
```javascript
async function loadLeaderboard(classCode, sortBy = 'xp') {
  try {
    const response = await fetch(
      `${API_CONFIG.baseURL}/api/leaderboard/${classCode}?sortBy=${sortBy}&student_id=${currentStudent.id}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    const data = await response.json();

    // Update UI
    document.getElementById('studentCount').textContent = data.total_students;
    renderLeaderboard(data.leaderboard, data.your_rank);

  } catch (error) {
    console.error('Error loading leaderboard:', error);
    alert('Failed to load leaderboard. Please try again.');
  }
}
```

#### 3. Render Leaderboard
```javascript
function renderLeaderboard(leaderboard, yourRank) {
  const tbody = document.getElementById('leaderboardBody');

  if (!leaderboard || leaderboard.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px;">
          No students in this class yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = leaderboard.map(student => {
    const isYou = student.student_id === currentStudent.id;
    const medal = getMedalIcon(student.rank);

    return `
      <tr class="leaderboard-row ${isYou ? 'your-row' : ''}"
          data-student-id="${student.student_id}">
        <td class="rank-cell">
          <span class="rank-medal">${medal}</span>
          <span class="rank-number">${student.rank}</span>
        </td>
        <td class="name-cell">
          ${student.name}
          ${isYou ? '<span class="you-badge">YOU</span>' : ''}
        </td>
        <td class="xp-cell">${student.total_xp.toLocaleString()} XP</td>
        <td class="badges-cell">${student.badges}/30</td>
        <td class="completion-cell">
          <div class="progress-mini">
            <div class="progress-bar-mini" style="width: ${student.completion_percentage}%;">
              ${student.completion_percentage}%
            </div>
          </div>
        </td>
        <td class="rank-cell">${student.rank_icon} ${student.current_rank}</td>
      </tr>
    `;
  }).join('');

  // Update your position card
  if (yourRank) {
    updateYourPositionCard(yourRank);
  }

  // Scroll to your row
  scrollToYourRow();
}
```

#### 4. Helper Functions
```javascript
function getMedalIcon(rank) {
  switch(rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '';
  }
}

function updateYourPositionCard(yourRank) {
  const card = document.getElementById('yourPosition');
  const student = yourRank.student;

  card.innerHTML = `
    <h2>Your Position</h2>
    <div class="position-details">
      <div class="rank-number">#${yourRank.position}</div>
      <div class="position-stats">
        <p><strong>XP:</strong> ${student.total_xp.toLocaleString()}</p>
        <p><strong>Badges:</strong> ${student.badges}/30</p>
        <p><strong>Completion:</strong> ${student.completion_percentage}%</p>
        <p><strong>Rank:</strong> ${student.rank_icon} ${student.current_rank}</p>
      </div>
    </div>
  `;
}

function scrollToYourRow() {
  setTimeout(() => {
    const yourRow = document.querySelector('.your-row');
    if (yourRow) {
      yourRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 300);
}

function setupSortButtons() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const sortBy = e.target.dataset.sort;

      // Update active state
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      // Reload leaderboard
      currentSort = sortBy;
      await loadLeaderboard(currentStudent.class_code, sortBy);
    });
  });
}
```

---

## CSS Styling (student/css/leaderboard.css)

```css
/* Header */
.leaderboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  text-align: center;
}

.class-info {
  margin: 20px 0;
  font-size: 1.2em;
}

.class-badge {
  background: rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: bold;
  margin-right: 20px;
}

/* Sort Options */
.sort-options {
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;
}

.button-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.sort-btn {
  background: #f0f0f0;
  border: 2px solid transparent;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-btn.active {
  background: #667eea;
  color: white;
  border-color: #764ba2;
  transform: scale(1.05);
}

.sort-btn:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

/* Your Position Card */
.your-position-card {
  max-width: 600px;
  margin: 30px auto;
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
  color: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.position-details {
  display: flex;
  align-items: center;
  gap: 30px;
}

.rank-number {
  font-size: 5em;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.position-stats p {
  margin: 10px 0;
  font-size: 1.2em;
}

/* Leaderboard Table */
.leaderboard-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}

.leaderboard-table {
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.leaderboard-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.leaderboard-table th {
  padding: 20px;
  text-align: left;
  font-weight: bold;
}

.leaderboard-row {
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.3s ease;
}

.leaderboard-row:hover {
  background: #f5f5f5;
}

.leaderboard-row.your-row {
  background: #fff3cd;
  border-left: 5px solid #ffc107;
  font-weight: bold;
}

.leaderboard-row td {
  padding: 20px;
}

.rank-medal {
  font-size: 1.5em;
  margin-right: 10px;
}

.you-badge {
  background: #ffc107;
  color: #333;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8em;
  margin-left: 10px;
}

/* Progress Bar Mini */
.progress-mini {
  background: #e0e0e0;
  border-radius: 10px;
  height: 25px;
  overflow: hidden;
  min-width: 100px;
}

.progress-bar-mini {
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.85em;
  font-weight: bold;
  transition: width 0.5s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .leaderboard-table {
    font-size: 0.9em;
  }

  .leaderboard-table th,
  .leaderboard-table td {
    padding: 12px 8px;
  }

  .rank-number {
    font-size: 3em;
  }

  .position-details {
    flex-direction: column;
    text-align: center;
  }

  .button-group {
    flex-direction: column;
  }

  .sort-btn {
    width: 100%;
  }
}
```

---

## Navigation Integration

### Update Dashboard (student/js/dashboard.js)

```javascript
function viewLeaderboard() {
  // Check if student has class_code
  const session = getSession();
  if (!session.class_code) {
    alert('You need to be assigned to a class to view the leaderboard.');
    return;
  }

  // Navigate to leaderboard
  window.location.href = 'leaderboard.html';
}
```

---

## Testing Plan

### Test Cases

```bash
# Test Case 1: Empty Class
- [ ] Class with 0 students shows empty message
- [ ] No errors in console

# Test Case 2: Class with 1 Student
- [ ] Student sees themselves as #1
- [ ] Stats display correctly

# Test Case 3: Class with 25 Students
- [ ] All students render correctly
- [ ] Sorting works for all options
- [ ] Your position highlighted
- [ ] Medals show for top 3

# Test Case 4: Sort by XP
- [ ] Students sorted by total XP (highest first)
- [ ] Ties broken by secondary criteria

# Test Case 5: Sort by Badges
- [ ] Students sorted by badge count
- [ ] Correct order maintained

# Test Case 6: Sort by Completion %
- [ ] Students sorted by completion percentage
- [ ] Percentages calculated correctly

# Test Case 7: Sort by Rank
- [ ] Students sorted by rank level
- [ ] Rank names display correctly

# Test Case 8: Your Position Card
- [ ] Shows correct rank number
- [ ] All stats accurate
- [ ] Card highlights properly

# Test Case 9: Scroll to Your Row
- [ ] Page auto-scrolls to your row
- [ ] Your row is highlighted

# Test Case 10: Responsive Design
- [ ] Works on mobile (table responsive)
- [ ] Sort buttons stack vertically
- [ ] Position card adapts
```

---

## Implementation Timeline

| Task | Time | Cumulative |
|------|------|------------|
| Backend API endpoint | 2 hours | 2 hr |
| HTML structure | 1 hour | 3 hr |
| JavaScript logic | 2 hours | 5 hr |
| CSS styling | 1.5 hours | 6.5 hr |
| Navigation integration | 30 min | 7 hr |
| Testing & debugging | 1 hour | 8 hr |

**Total Time**: 6-8 hours

---

## Success Criteria

✅ **Must Have (MVP)**:
- Students can view class leaderboard
- Sort by XP, badges, completion %, rank
- Current student row highlighted
- Top 3 get medal icons
- Shows student count and class name
- Responsive design

🎯 **Nice to Have (Future)**:
- Filter by date range (weekly/monthly/all-time)
- Multiple classes view for teachers
- Export leaderboard to PDF
- Achievements section
- Animated rank changes

---

**Status**: 📋 PLANNED (Not Yet Implemented)
**Dependencies**: None (all data already available)
**Next Step**: Implement backend API endpoint first

---

**Document Version**: 1.0
**Created**: October 24, 2025
