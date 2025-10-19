# 04 - Admin UI Dashboard

## 📋 File Info
- **Order:** Fourth
- **Duration:** Week 2, Day 3-5
- **Dependencies:** 01_Database_Schema.md, 02_Backend_API.md (must be complete)
- **Next File:** 05_Login_Authentication.md (optional)
- **Can Work Parallel With:** 03_Tutorial_Tracking_Integration.md

---

## Overview

Build a simple admin dashboard where teachers can view all student progress.

**What you'll create:**
- Student list page (main dashboard)
- Student detail page (individual progress)
- Basic statistics overview
- Simple, clean design with Bootstrap

---

## File Structure

Create a new folder: `admin/`

```
Web_Service/
├── admin/
│   ├── index.html           # Main dashboard (student list)
│   ├── student-detail.html  # Individual student view
│   ├── style.css            # Custom styles
│   └── app.js               # JavaScript logic
```

---

## Page 1: Student List Dashboard

### **Create file: admin/index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Progress Dashboard</title>

  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Custom styles -->
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- Header -->
  <header class="dashboard-header">
    <div class="container">
      <h1>📊 Roblox Tutorial - Progress Dashboard</h1>
      <p class="subtitle">Monitor student progress in real-time</p>
    </div>
  </header>

  <!-- Main Content -->
  <div class="container mt-4">

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value" id="totalStudents">-</div>
          <div class="stat-label">Total Students</div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value" id="activeStudents">-</div>
          <div class="stat-label">Active Now</div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="stat-card">
          <div class="stat-icon">🎓</div>
          <div class="stat-value" id="avgProgress">-</div>
          <div class="stat-label">Avg Progress</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar mb-3">
      <div class="row">
        <div class="col-md-4">
          <input type="text" id="searchBox" class="form-control" placeholder="🔍 Search by name...">
        </div>

        <div class="col-md-3">
          <select id="classFilter" class="form-select">
            <option value="">All Classes</option>
            <!-- Will be populated dynamically -->
          </select>
        </div>

        <div class="col-md-3">
          <select id="progressFilter" class="form-select">
            <option value="">All Progress</option>
            <option value="0-20">0-20% (Just Started)</option>
            <option value="20-50">20-50% (In Progress)</option>
            <option value="50-80">50-80% (Almost Done)</option>
            <option value="80-100">80-100% (Completed)</option>
          </select>
        </div>

        <div class="col-md-2">
          <button class="btn btn-primary w-100" onclick="refreshData()">
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Students Table -->
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">Student List</h5>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Class Code</th>
                <th>Current Level</th>
                <th>Progress</th>
                <th>Total XP</th>
                <th>Quiz Score</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="studentsTableBody">
              <tr>
                <td colspan="8" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2">Loading students...</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>

  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="app.js"></script>
  <script>
    // Load students on page load
    window.addEventListener('DOMContentLoaded', loadStudents);
  </script>

</body>
</html>
```

---

## Page 2: Student Detail View

### **Create file: admin/student-detail.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Details</title>

  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Chart.js for visualizations -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

  <!-- Custom styles -->
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- Header -->
  <header class="dashboard-header">
    <div class="container">
      <div class="d-flex align-items-center gap-3">
        <a href="index.html" class="btn btn-outline-light">← Back</a>
        <div>
          <h1 id="studentName">Student Details</h1>
          <p class="subtitle mb-0" id="studentInfo">Loading...</p>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <div class="container mt-4">

    <!-- Summary Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-value" id="detailProgress">-</div>
          <div class="stat-label">Overall Progress</div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon">🎮</div>
          <div class="stat-value" id="detailLevel">-</div>
          <div class="stat-label">Current Level</div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-value" id="detailXP">-</div>
          <div class="stat-label">Total XP</div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon">✓</div>
          <div class="stat-value" id="detailSteps">-</div>
          <div class="stat-label">Steps Completed</div>
        </div>
      </div>
    </div>

    <!-- Progress by Level -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">Progress by Level</h5>
      </div>
      <div class="card-body">
        <div id="levelProgressContainer">
          <!-- Will be populated dynamically -->
        </div>
      </div>
    </div>

    <!-- Progress Chart -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">Activity Timeline</h5>
      </div>
      <div class="card-body">
        <canvas id="progressChart"></canvas>
      </div>
    </div>

    <!-- Event History -->
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">Recent Activity</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event Type</th>
                <th>Level</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody id="eventsTableBody">
              <tr>
                <td colspan="4" class="text-center py-3">Loading...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>

  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="app.js"></script>
  <script>
    // Get student ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    if (studentId) {
      window.addEventListener('DOMContentLoaded', () => loadStudentDetail(studentId));
    } else {
      alert('No student ID provided');
      window.location.href = 'index.html';
    }
  </script>

</body>
</html>
```

---

## Styling

### **Create file: admin/style.css**

```css
/* =====================
   GENERAL STYLES
===================== */

body {
  background: #f5f7fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* =====================
   HEADER
===================== */

.dashboard-header {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  padding: 30px 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.dashboard-header .subtitle {
  margin: 5px 0 0 0;
  opacity: 0.95;
  font-size: 1rem;
}

/* =====================
   STAT CARDS
===================== */

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* =====================
   FILTER BAR
===================== */

.filter-bar {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* =====================
   TABLE
===================== */

.table {
  margin-bottom: 0;
}

.table thead {
  background: #f8f9fa;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table tbody tr {
  transition: background 0.2s ease;
}

.table tbody tr:hover {
  background: #f8f9fa;
}

/* =====================
   PROGRESS BAR
===================== */

.progress {
  height: 25px;
  border-radius: 12px;
  background: #e9ecef;
}

.progress-bar {
  background: linear-gradient(90deg, #ff6b35, #f7931e);
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
}

/* =====================
   BADGES
===================== */

.badge {
  padding: 6px 12px;
  font-weight: 600;
  border-radius: 6px;
}

.level-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 0.85rem;
}

.xp-badge {
  background: linear-gradient(135deg, #f7931e, #ff6b35);
  color: white;
  font-size: 0.85rem;
}

/* =====================
   LEVEL PROGRESS ITEM
===================== */

.level-progress-item {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 15px;
  border-left: 5px solid #667eea;
}

.level-progress-item.completed {
  border-left-color: #28a745;
  background: #d4edda;
}

.level-progress-item.in-progress {
  border-left-color: #ffc107;
  background: #fff3cd;
}

.level-progress-item.not-started {
  border-left-color: #dc3545;
  background: #f8d7da;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.level-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.level-status {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.level-status.completed {
  background: #28a745;
  color: white;
}

.level-status.in-progress {
  background: #ffc107;
  color: #333;
}

.level-status.not-started {
  background: #dc3545;
  color: white;
}

/* =====================
   CARDS
===================== */

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.card-header {
  background: white;
  border-bottom: 2px solid #f0f0f0;
  border-radius: 12px 12px 0 0 !important;
  padding: 20px;
  font-weight: 600;
}

/* =====================
   RESPONSIVE
===================== */

@media (max-width: 768px) {
  .dashboard-header h1 {
    font-size: 1.5rem;
  }

  .stat-card {
    margin-bottom: 15px;
  }

  .filter-bar .row > div {
    margin-bottom: 10px;
  }
}
```

---

## JavaScript Logic

### **Create file: admin/app.js**

```javascript
// ===========================
// API CONFIGURATION
// ===========================

const API_CONFIG = {
  baseURL: 'http://localhost:3000/api',
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
```

---

## Testing the Dashboard

### **Step 1: Start backend server**

```bash
cd backend
node server.js
```

---

### **Step 2: Open dashboard**

Open `admin/index.html` in your browser

**Expected:**
- Statistics cards show total students
- Student table loads with data
- Can search and filter students

---

### **Step 3: Click "View Details"**

Should navigate to `student-detail.html?id=1`

**Expected:**
- Student name and info shown
- Progress cards populated
- Level-by-level breakdown displayed
- Activity chart rendered
- Event history shown

---

### **Step 4: Test filters**

1. **Search:** Type student name → table filters
2. **Class filter:** Select class → shows only that class
3. **Progress filter:** Select range → shows students in that range

---

## Common Issues

### **Issue 1: Blank page**

**Solution:** Open browser console (F12) and check for errors. Make sure:
- Backend server is running
- API URL is correct in app.js
- No CORS errors

---

### **Issue 2: Chart not showing**

**Solution:** Check that Chart.js is loaded:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

---

### **Issue 3: Student detail page shows "No student ID"**

**Solution:** Make sure you're clicking from the main page, not accessing directly. URL should have `?id=1`

---

## Checklist

Before moving to next file:

- [ ] admin/ folder created
- [ ] index.html displays student list
- [ ] student-detail.html shows individual progress
- [ ] style.css loads correctly
- [ ] app.js connects to API
- [ ] Statistics cards work
- [ ] Search and filters work
- [ ] Level progress displays correctly
- [ ] Activity chart renders
- [ ] Event history shows
- [ ] Tested with sample data

---

## Next Steps

**✅ Admin dashboard is complete!**

**👉 Move to:** `05_Login_Authentication.md` (OPTIONAL)

Or skip to: `06_Deployment_Guide.md`

---

**Document Status:** ✅ Complete
**Last Updated:** October 18, 2025
**Version:** 1.0
