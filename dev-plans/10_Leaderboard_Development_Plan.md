# Leaderboard Development Plan

**Project:** Roblox Studio Academy - Student Progress Monitoring System
**Feature:** Student Leaderboard
**Date:** October 25, 2025
**Status:** 📋 Planning Phase

---

## Table of Contents

1. [Overview](#overview)
2. [Goals & Objectives](#goals--objectives)
3. [Feature Requirements](#feature-requirements)
4. [Database Design](#database-design)
5. [Backend API Design](#backend-api-design)
6. [Frontend UI Design](#frontend-ui-design)
7. [Implementation Phases](#implementation-phases)
8. [Security & Privacy](#security--privacy)
9. [Testing Plan](#testing-plan)
10. [Optional Features](#optional-features)
11. [Timeline Estimate](#timeline-estimate)

---

## Overview

### What is the Leaderboard?

A **leaderboard system** that displays student rankings based on:
- Total XP earned
- Courses completed
- Quiz scores
- Overall progress percentage
- Badges earned

### Who Will Use It?

**Students**: View their rank and compare progress with classmates (motivational)
**Teachers**: Monitor top performers and identify students who need help
**Admins**: View school-wide or class-specific rankings

### Why Add a Leaderboard?

**Benefits:**
- ✅ Motivates students through friendly competition
- ✅ Gamifies learning experience
- ✅ Encourages course completion
- ✅ Identifies top performers for recognition
- ✅ Highlights students who may need extra support

---

## Goals & Objectives

### Primary Goals

1. **Increase Student Engagement**
   - Make learning fun and competitive
   - Encourage students to complete more courses

2. **Provide Performance Insights**
   - Show teachers who the top performers are
   - Identify students falling behind

3. **Maintain Fairness**
   - Rank students based on actual achievement (not time spent)
   - Prevent gaming the system

### Success Metrics

- **Engagement**: 50%+ of students check leaderboard weekly
- **Completion Rate**: 20% increase in course completions
- **Teacher Adoption**: 80%+ of teachers use leaderboard for insights
- **Student Satisfaction**: Positive feedback from 70%+ students

---

## Feature Requirements

### Must-Have Features (MVP)

#### 1. Class-Wide Leaderboard
- Display top 10 students in the class
- Rank by total XP (primary metric)
- Show: Rank, Name, XP, Courses Completed, Progress %

#### 2. Individual Student Ranking
- Show each student their own rank
- Display: "You are ranked #5 out of 25 students"
- Show how much XP needed to reach next rank

#### 3. Filtering Options
- Filter by class code (for teachers with multiple classes)
- Filter by time period:
  - All Time (default)
  - This Month
  - This Week

#### 4. Ranking Criteria
**Primary Metric**: Total XP
**Tie Breaker 1**: Number of courses completed
**Tie Breaker 2**: Overall progress percentage
**Tie Breaker 3**: Quiz score average

#### 5. Public vs Private Modes
- **Public Mode**: All students see all ranks (default)
- **Private Mode**: Students only see their own rank (teacher can toggle)

### Should-Have Features (Phase 2)

#### 6. Achievements & Badges Display
- Show special badges next to student names
- Examples:
  - 🥇 Top Performer (Rank 1)
  - 🔥 Most Improved (biggest XP gain this week)
  - 🎯 Perfect Score (100% on all quizzes)
  - ⚡ Speed Demon (fastest course completion)

#### 7. Historical Rankings
- Show rank changes (↑ +2, ↓ -1, ➡ No change)
- Track rank history over time
- Display chart: "Your rank over the last 4 weeks"

#### 8. Team/Group Leaderboards
- Allow teachers to create teams
- Display team rankings based on combined XP
- Encourage collaboration

### Nice-to-Have Features (Phase 3)

#### 9. School-Wide Leaderboard
- Show top students across all classes
- Filter by grade level
- Display on public dashboard (optional)

#### 10. Custom Leaderboards
- Teachers create custom leaderboards (e.g., "Quiz Masters")
- Rank by specific metrics (quiz scores only, fastest completions, etc.)

#### 11. Leaderboard Challenges
- Time-limited competitions (e.g., "Earn 500 XP this week")
- Special prizes/badges for winners

---

## Database Design

### New Tables

#### Table: `leaderboard_settings`
Store teacher preferences for leaderboard display.

```sql
CREATE TABLE leaderboard_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_code TEXT NOT NULL,
  is_public BOOLEAN DEFAULT 1,  -- 1 = public, 0 = private
  show_full_names BOOLEAN DEFAULT 1,  -- Show full names or initials
  show_xp BOOLEAN DEFAULT 1,  -- Show XP values
  show_rank_changes BOOLEAN DEFAULT 1,  -- Show up/down arrows
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `leaderboard_snapshots`
Store historical rankings for tracking changes over time.

```sql
CREATE TABLE leaderboard_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  class_code TEXT NOT NULL,
  rank INTEGER NOT NULL,
  total_xp INTEGER NOT NULL,
  courses_completed INTEGER NOT NULL,
  progress_percentage INTEGER NOT NULL,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE INDEX idx_leaderboard_snapshots_student ON leaderboard_snapshots(student_id);
CREATE INDEX idx_leaderboard_snapshots_date ON leaderboard_snapshots(snapshot_date);
CREATE INDEX idx_leaderboard_snapshots_class ON leaderboard_snapshots(class_code);
```

#### Table: `achievements` (Optional - Phase 2)
Store student achievements and badges.

```sql
CREATE TABLE achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  achievement_type TEXT NOT NULL,  -- 'top_performer', 'perfect_score', etc.
  achievement_name TEXT NOT NULL,
  achievement_icon TEXT,  -- Emoji or icon name
  earned_date DATE NOT NULL,
  metadata TEXT,  -- JSON data (e.g., {"rank": 1, "date": "2025-10-25"})
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE INDEX idx_achievements_student ON achievements(student_id);
```

### Modified Tables

**No changes needed!** Existing tables have all data needed:
- `students` table: name, class_code, role
- `progress_events` table: All student activity
- `courses` table: Course information

### Data We Can Calculate (No Storage Needed)

Calculate rankings dynamically from existing data:
- **Total XP**: Sum of all XP from progress_events
- **Courses Completed**: Count distinct courses with 100% progress
- **Progress %**: Average progress across all courses
- **Quiz Score**: Average of correct quiz answers

---

## Backend API Design

### New API Endpoints

#### 1. GET `/api/leaderboard/class/:classCode`
Get leaderboard for a specific class.

**Query Parameters:**
- `period` (optional): `all`, `month`, `week` (default: `all`)
- `limit` (optional): Number of top students to return (default: `10`)
- `studentId` (optional): If provided, always include this student even if not in top N

**Response:**
```json
{
  "class_code": "RBLX2025",
  "period": "all",
  "total_students": 25,
  "leaderboard": [
    {
      "rank": 1,
      "student_id": 17,
      "name": "James",
      "total_xp": 1500,
      "courses_completed": 3,
      "progress_percentage": 75,
      "quiz_score_avg": 95,
      "badges": ["🥇", "🔥"],
      "rank_change": null  // First time ranking
    },
    {
      "rank": 2,
      "student_id": 18,
      "name": "Alice",
      "total_xp": 1450,
      "courses_completed": 3,
      "progress_percentage": 70,
      "quiz_score_avg": 92,
      "badges": ["🎯"],
      "rank_change": 0  // No change from last week
    }
    // ... more students
  ],
  "current_student": {
    "rank": 5,
    "student_id": 19,
    "name": "You",
    "total_xp": 1200,
    "rank_change": 2,  // Moved up 2 spots
    "xp_to_next_rank": 50  // Need 50 more XP to reach rank 4
  }
}
```

#### 2. GET `/api/leaderboard/student/:studentId`
Get individual student's ranking details.

**Response:**
```json
{
  "student_id": 19,
  "name": "Bob",
  "class_code": "RBLX2025",
  "rank": 5,
  "total_students": 25,
  "total_xp": 1200,
  "courses_completed": 2,
  "progress_percentage": 50,
  "quiz_score_avg": 88,
  "rank_history": [
    {"date": "2025-10-18", "rank": 7},
    {"date": "2025-10-25", "rank": 5}
  ],
  "xp_to_next_rank": 50,
  "xp_to_top_rank": 300
}
```

#### 3. GET `/api/leaderboard/school`
Get school-wide leaderboard (all classes combined).

**Query Parameters:**
- `period`: `all`, `month`, `week`
- `limit`: Top N students (default: 20)

**Response:**
```json
{
  "period": "all",
  "total_students": 150,
  "leaderboard": [
    {
      "rank": 1,
      "student_id": 45,
      "name": "Sarah",
      "class_code": "RBLX2026",
      "total_xp": 2500,
      "courses_completed": 4,
      "badges": ["🥇", "🔥", "🎯"]
    }
    // ... more students
  ]
}
```

#### 4. GET `/api/leaderboard/settings/:classCode`
Get leaderboard settings for a class.

**Response:**
```json
{
  "class_code": "RBLX2025",
  "is_public": true,
  "show_full_names": true,
  "show_xp": true,
  "show_rank_changes": true
}
```

#### 5. PUT `/api/leaderboard/settings/:classCode`
Update leaderboard settings (teacher/admin only).

**Request Body:**
```json
{
  "is_public": false,
  "show_full_names": false,
  "show_xp": true,
  "show_rank_changes": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leaderboard settings updated",
  "settings": { /* updated settings */ }
}
```

#### 6. POST `/api/leaderboard/snapshot`
Create a snapshot of current rankings (cron job / scheduled task).

**Request Body:**
```json
{
  "class_code": "RBLX2025"  // Or "ALL" for all classes
}
```

**Response:**
```json
{
  "success": true,
  "snapshots_created": 25,
  "date": "2025-10-25"
}
```

### Backend Functions

**File:** `backend/routes.js` (add new section)

```javascript
// ===========================
// LEADERBOARD ENDPOINTS
// ===========================

// Helper: Calculate student rankings for a class
function calculateLeaderboard(classCode, period = 'all') {
  // 1. Get all students in the class
  // 2. Calculate total XP for each student
  // 3. Calculate courses completed
  // 4. Calculate progress percentage
  // 5. Calculate quiz score average
  // 6. Sort by XP (desc), then courses completed (desc), then progress % (desc)
  // 7. Assign ranks (handle ties)
  // 8. Return sorted array
}

// Helper: Get rank changes from last snapshot
function getRankChanges(classCode, studentId) {
  // 1. Get student's current rank
  // 2. Get student's rank from last snapshot (1 week ago)
  // 3. Calculate difference
  // 4. Return change (+2, -1, 0)
}

// GET /api/leaderboard/class/:classCode
router.get('/leaderboard/class/:classCode', (req, res) => {
  const { classCode } = req.params;
  const { period = 'all', limit = 10, studentId } = req.query;

  // Calculate leaderboard
  const leaderboard = calculateLeaderboard(classCode, period);

  // Get top N students
  const topStudents = leaderboard.slice(0, limit);

  // If studentId provided and not in top N, include them separately
  let currentStudent = null;
  if (studentId) {
    currentStudent = leaderboard.find(s => s.student_id === parseInt(studentId));
  }

  res.json({
    class_code: classCode,
    period,
    total_students: leaderboard.length,
    leaderboard: topStudents,
    current_student: currentStudent
  });
});
```

---

## Frontend UI Design

### 1. Student Leaderboard Page

**Location:** `student/leaderboard.html`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 🏆 Class Leaderboard - RBLX2025                        │
├─────────────────────────────────────────────────────────┤
│ Your Rank: #5 out of 25 students     [▼ All Time ▼]   │
│ 💎 1,200 XP  |  ⏫ Up 2 spots this week                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🥇 #1  James            💎 1,500 XP   📚 3/4 Courses  │
│  🥈 #2  Alice            💎 1,450 XP   📚 3/4 Courses  │
│  🥉 #3  Carol            💎 1,420 XP   📚 3/4 Courses  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  #4  David             💎 1,250 XP   📚 2/4 Courses   │
│  ➡️ #5  You (Bob)         💎 1,200 XP   📚 2/4 Courses   │
│  #6  Eve               💎 1,150 XP   📚 2/4 Courses   │
│  #7  Frank             💎 1,100 XP   📚 2/4 Courses   │
│  #8  Grace             💎 1,050 XP   📚 2/4 Courses   │
│  #9  Henry             💎 1,000 XP   📚 1/4 Courses   │
│  #10 Ivy               💎 950 XP    📚 1/4 Courses    │
│                                                         │
│  You need 50 more XP to reach Rank #4! 💪              │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Highlight current student's row in different color
- Medal icons (🥇🥈🥉) for top 3
- Progress bars showing XP visually
- Time period filter dropdown (All Time, This Month, This Week)
- Badge icons next to student names

### 2. Teacher Leaderboard View

**Location:** `teacher/leaderboard.html`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Teacher Dashboard > Leaderboard                      │
├─────────────────────────────────────────────────────────┤
│ Class: [RBLX2025 ▼]   Period: [All Time ▼]            │
│                                                         │
│ ⚙️ Settings:  [✓] Public  [✓] Show Names  [✓] Show XP │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Rank  Student        XP      Courses  Progress  Quiz  │
│  ────  ────────────  ─────   ───────  ────────  ────  │
│  🥇 1   James         1,500   3/4      75%       95%   │
│  🥈 2   Alice         1,450   3/4      70%       92%   │
│  🥉 3   Carol         1,420   3/4      68%       90%   │
│  #4    David         1,250   2/4      50%       88%   │
│  #5    Bob           1,200   2/4      50%       88%   │
│  #6    Eve           1,150   2/4      48%       85%   │
│  #7    Frank         1,100   2/4      45%       82%   │
│  #8    Grace         1,050   2/4      42%       80%   │
│  #9    Henry         1,000   1/4      25%       75%   │
│  #10   Ivy           950     1/4      22%       70%   │
│  ...                                                    │
│  #25   Zack          100     0/4      5%        60%   │
│                                                         │
│  [Export CSV] [View Full List (25 students)]           │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Sortable columns (click column header to sort)
- Filter by class (dropdown)
- Export to CSV for reporting
- Settings toggle (public/private mode)
- Click student name → go to student detail page

### 3. Admin School-Wide Leaderboard

**Location:** `admin/leaderboard.html`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 🏆 School-Wide Leaderboard                              │
├─────────────────────────────────────────────────────────┤
│ Total Students: 150   |   Period: [This Month ▼]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Rank  Student        Class      XP      Courses       │
│  ────  ────────────  ────────   ─────   ────────       │
│  🥇 1   Sarah         RBLX2026   2,500   4/4 Complete  │
│  🥈 2   Michael       RBLX2025   2,400   4/4 Complete  │
│  🥉 3   Jessica       RBLX2027   2,350   4/4 Complete  │
│  #4    James         RBLX2025   1,500   3/4           │
│  #5    Emily         RBLX2026   1,480   3/4           │
│  ...                                                    │
│  #20   Ryan          RBLX2027   1,200   2/4           │
│                                                         │
│  [View Top 50] [Export Report]                         │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: MVP (Core Leaderboard) - 3-4 days

**Goal:** Basic leaderboard functionality for students and teachers

#### Step 1.1: Database Setup (1 hour)
```bash
# Create migration file
node backend/migrate-leaderboard.js
```

**Tasks:**
- [ ] Create `leaderboard_settings` table
- [ ] Create `leaderboard_snapshots` table
- [ ] Add indexes for performance
- [ ] Insert default settings for existing classes

#### Step 1.2: Backend API (1 day)
**File:** `backend/routes.js`

**Tasks:**
- [ ] Implement `calculateLeaderboard()` helper function
- [ ] Create `GET /api/leaderboard/class/:classCode` endpoint
- [ ] Create `GET /api/leaderboard/student/:studentId` endpoint
- [ ] Create `GET /api/leaderboard/settings/:classCode` endpoint
- [ ] Create `PUT /api/leaderboard/settings/:classCode` endpoint
- [ ] Test all endpoints with curl/Postman

#### Step 1.3: Student Frontend (1 day)
**Files:** `student/leaderboard.html`, `student/js/leaderboard.js`

**Tasks:**
- [ ] Create leaderboard HTML page
- [ ] Add navigation link in student dashboard
- [ ] Fetch leaderboard data from API
- [ ] Display top 10 students
- [ ] Highlight current student's rank
- [ ] Show "XP needed to next rank" message
- [ ] Add time period filter (All/Month/Week)
- [ ] Test with multiple students

#### Step 1.4: Teacher Frontend (1 day)
**Files:** `teacher/leaderboard.html`, `teacher/js/leaderboard.js`

**Tasks:**
- [ ] Create teacher leaderboard HTML page
- [ ] Add navigation link in teacher dashboard
- [ ] Fetch leaderboard data from API
- [ ] Display full class rankings
- [ ] Add sortable columns
- [ ] Add settings toggle (public/private)
- [ ] Link student names to detail pages
- [ ] Test with multiple classes

#### Step 1.5: Testing & Bug Fixes (0.5 day)
- [ ] Test with 0 students (empty state)
- [ ] Test with 1 student (edge case)
- [ ] Test with 100+ students (performance)
- [ ] Test rank tie-breaking logic
- [ ] Test time period filters
- [ ] Fix any bugs found

### Phase 2: Enhanced Features - 2-3 days

**Goal:** Add historical rankings, rank changes, achievements

#### Step 2.1: Historical Rankings (1 day)
**Tasks:**
- [ ] Create cron job to save daily snapshots
- [ ] Implement `getRankChanges()` function
- [ ] Add rank change arrows (↑ ↓ ➡) to UI
- [ ] Display rank history chart

#### Step 2.2: Achievements System (1 day)
**Tasks:**
- [ ] Create `achievements` table
- [ ] Define achievement types (Top Performer, Perfect Score, etc.)
- [ ] Implement achievement detection logic
- [ ] Award achievements automatically
- [ ] Display badges on leaderboard
- [ ] Create achievements page

#### Step 2.3: Enhanced UI (1 day)
**Tasks:**
- [ ] Add animations for rank changes
- [ ] Add confetti effect for #1 rank
- [ ] Create rank history chart (Chart.js)
- [ ] Add mobile-responsive design
- [ ] Improve loading states

### Phase 3: Advanced Features - 2-3 days

**Goal:** Team leaderboards, custom leaderboards, challenges

#### Step 3.1: Team Leaderboards (1 day)
**Tasks:**
- [ ] Create `teams` table
- [ ] Allow teachers to create teams
- [ ] Calculate team rankings (sum of member XP)
- [ ] Create team leaderboard view

#### Step 3.2: School-Wide Leaderboard (1 day)
**Tasks:**
- [ ] Create `GET /api/leaderboard/school` endpoint
- [ ] Create admin school leaderboard page
- [ ] Add grade-level filtering
- [ ] Add public display option (for hallway screens)

#### Step 3.3: Custom Leaderboards (1 day)
**Tasks:**
- [ ] Allow custom ranking criteria
- [ ] Create quiz-only leaderboard
- [ ] Create speed-completion leaderboard
- [ ] Save custom leaderboard configurations

---

## Security & Privacy

### Privacy Considerations

#### 1. Student Data Protection
- **Never show student last names** publicly
- **Allow teachers to toggle** public/private mode
- **Let students opt-out** of leaderboard (show as "Anonymous")

#### 2. FERPA Compliance
- Leaderboard only visible to same class
- Students cannot see other classes' rankings
- Parents can request student be hidden

#### 3. Prevent Gaming the System
- **XP cannot be manually adjusted** (only earned through activity)
- **Detect suspicious activity** (e.g., 10,000 XP in 1 hour)
- **Rate limit API calls** to prevent scraping

### Authorization Rules

| Role | Can View | Can Edit Settings | Can Export |
|------|----------|-------------------|------------|
| Student | Own class only | ❌ No | ❌ No |
| Teacher | Own classes | ✅ Yes | ✅ Yes (own classes) |
| Admin | All classes | ✅ Yes | ✅ Yes (all data) |

### API Security

**All leaderboard endpoints require authentication:**
```javascript
// In routes.js
router.get('/leaderboard/class/:classCode', requireAuth, (req, res) => {
  const user = getSession(req);
  const { classCode } = req.params;

  // Students can only view their own class
  if (user.role === 'student' && user.class_code !== classCode) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Teachers can only view their assigned classes
  if (user.role === 'teacher' && !user.classes.includes(classCode)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // ... rest of endpoint logic
});
```

---

## Testing Plan

### Unit Tests

#### Backend Tests (`backend/test-leaderboard.js`)
```javascript
// Test 1: calculateLeaderboard() returns correct rankings
// Test 2: Tie-breaking works correctly (same XP, different courses)
// Test 3: Time period filtering works (all/month/week)
// Test 4: getRankChanges() calculates differences correctly
// Test 5: Empty class returns empty leaderboard
```

#### Frontend Tests (Manual)
```
// Test 6: Student sees their own rank highlighted
// Test 7: Top 3 students have medal icons
// Test 8: Time period filter updates rankings
// Test 9: Settings toggle works (public/private)
// Test 10: Clicking student name goes to detail page
```

### Integration Tests

#### End-to-End Scenarios
```
Scenario 1: New student joins class
  - Student appears at bottom of leaderboard
  - Student completes course
  - Student moves up in rankings
  - Leaderboard updates immediately

Scenario 2: Teacher toggles private mode
  - Students can no longer see classmates
  - Students only see their own rank
  - Teacher can still see all rankings

Scenario 3: Student earns achievement
  - Badge appears next to student name
  - Achievement shows in student profile
  - Notification sent to student
```

### Performance Tests

```
Load Test 1: 100 students in class
  - API response time < 500ms
  - Page load time < 2 seconds

Load Test 2: 1000 students school-wide
  - API response time < 1 second
  - Pagination required (show 20 at a time)

Stress Test: 10 concurrent requests
  - Server handles load without crashing
  - No race conditions in ranking calculation
```

---

## Optional Features (Future Enhancements)

### 1. Leaderboard Widget
Small widget on student dashboard showing:
- Current rank
- XP to next rank
- Mini top-3 list

### 2. Email Notifications
- Weekly rank summary email
- Alert when passing a classmate
- Congratulations for top 3

### 3. Certificates & Rewards
- Generate PDF certificate for #1 student
- Monthly "Student of the Month" badge
- Print-ready awards for teachers

### 4. Leaderboard API for External Use
- Public API endpoint (opt-in)
- Embed leaderboard on school website
- Display on classroom smart boards

### 5. Seasonal Leaderboards
- Reset rankings each semester
- Archive past leaderboards
- Compare performance across terms

### 6. Social Features
- "Congratulate" button to cheer classmates
- Share rank on social media (opt-in)
- Friend challenges (1v1 competitions)

---

## Timeline Estimate

### MVP Implementation (Phase 1)

| Task | Time | Dependencies |
|------|------|--------------|
| Database design & migration | 1 hour | None |
| Backend API endpoints | 1 day | Database |
| Student frontend | 1 day | Backend API |
| Teacher frontend | 1 day | Backend API |
| Testing & bug fixes | 4 hours | All above |
| **Total** | **3-4 days** | |

### Enhanced Features (Phase 2)

| Task | Time | Dependencies |
|------|------|--------------|
| Historical rankings & snapshots | 1 day | Phase 1 |
| Achievements system | 1 day | Phase 1 |
| UI enhancements | 1 day | Phase 1 |
| **Total** | **3 days** | |

### Advanced Features (Phase 3)

| Task | Time | Dependencies |
|------|------|--------------|
| Team leaderboards | 1 day | Phase 1 |
| School-wide leaderboard | 1 day | Phase 1 |
| Custom leaderboards | 1 day | Phase 1 |
| **Total** | **3 days** | |

### **Grand Total: 9-10 days**

**Minimum Viable Product**: 3-4 days
**Fully Featured System**: 9-10 days

---

## Success Criteria

### How We Know It's Working

✅ **Engagement Metrics**
- 50%+ of students visit leaderboard weekly
- Average session time on leaderboard: 2+ minutes
- 30%+ of students check rank daily

✅ **Academic Metrics**
- 20% increase in course completion rate
- 15% increase in average quiz scores
- 25% more students completing all courses

✅ **Teacher Adoption**
- 80%+ of teachers use leaderboard regularly
- Teachers report increased student motivation
- Leaderboard used in parent-teacher conferences

✅ **Technical Metrics**
- API response time < 500ms (avg)
- Zero data breaches or privacy violations
- 99.9% uptime

---

## Risks & Mitigation

### Risk 1: Discourages Low-Performing Students
**Problem:** Students at bottom may feel demotivated

**Mitigation:**
- Show "Most Improved" rankings
- Highlight personal progress (not just rank)
- Allow students to opt-out
- Focus messaging on "improving your own rank" not "beating others"

### Risk 2: Privacy Concerns
**Problem:** Parents uncomfortable with public rankings

**Mitigation:**
- Make private mode the default
- Allow individual opt-out
- Never show student last names
- Obtain parental consent

### Risk 3: System Gaming
**Problem:** Students find ways to cheat (e.g., rapid clicking)

**Mitigation:**
- XP only earned through legitimate activity
- Rate limit API calls
- Detect suspicious patterns
- Manual review of top performers

### Risk 4: Performance Issues
**Problem:** Slow loading with many students

**Mitigation:**
- Cache leaderboard data (refresh every 5 min)
- Use database indexes
- Pagination for large classes
- Pre-calculate rankings daily

---

## Next Steps

### Immediate Actions

1. **Review this plan with stakeholders**
   - Get teacher feedback
   - Survey students about interest
   - Check with admin on privacy policies

2. **Create database migration**
   - Design tables
   - Write migration script
   - Test on dev database

3. **Build MVP (Phase 1)**
   - Start with backend API
   - Then student frontend
   - Then teacher frontend

4. **Pilot test with 1-2 classes**
   - Get feedback
   - Iterate on design
   - Fix bugs

5. **Roll out school-wide**
   - Train teachers
   - Notify students/parents
   - Monitor usage and engagement

---

## Questions to Resolve

### Before Starting Implementation

1. **Privacy Policy**
   - Do we need parental consent?
   - Should private mode be default?
   - Can students opt-out?

2. **Ranking Criteria**
   - Should XP be the primary metric?
   - Should quiz scores matter more?
   - How to handle ties?

3. **Display Options**
   - Show full names or first name + last initial?
   - Show exact XP or just relative rank?
   - Show all students or top 10 only?

4. **Update Frequency**
   - Real-time updates or daily snapshots?
   - How often to refresh rankings?
   - When to create historical snapshots?

---

## Resources & References

### Similar Systems (Inspiration)

- **Kahoot!** - Game-based leaderboard
- **Duolingo** - XP-based rankings with streaks
- **Khan Academy** - Energy points and badges
- **Classcraft** - Team-based leaderboards

### Technical Documentation

- [SQLite Window Functions](https://www.sqlite.org/windowfunctions.html) (for ranking)
- [Chart.js Documentation](https://www.chartjs.org/) (for charts)
- [Bootstrap 5 Tables](https://getbootstrap.com/docs/5.0/content/tables/) (for UI)

---

## Appendix

### Sample SQL Queries

#### Calculate Student Rankings
```sql
SELECT
  s.id,
  s.name,
  s.class_code,
  COALESCE(SUM(CASE
    WHEN pe.event_type = 'step_checked' THEN 20
    WHEN pe.event_type = 'quiz_answered' AND JSON_EXTRACT(pe.data, '$.correct') = 1 THEN 100
    ELSE 0
  END), 0) as total_xp,
  COUNT(DISTINCT CASE WHEN pe.event_type = 'level_unlocked' THEN pe.course_id END) as courses_completed,
  RANK() OVER (PARTITION BY s.class_code ORDER BY total_xp DESC, courses_completed DESC) as rank
FROM students s
LEFT JOIN progress_events pe ON s.id = pe.student_id
WHERE s.role = 'student' AND s.class_code = 'RBLX2025'
GROUP BY s.id
ORDER BY rank;
```

#### Get Rank Changes
```sql
SELECT
  current.student_id,
  current.rank as current_rank,
  previous.rank as previous_rank,
  (previous.rank - current.rank) as rank_change
FROM leaderboard_snapshots current
LEFT JOIN leaderboard_snapshots previous
  ON current.student_id = previous.student_id
  AND previous.snapshot_date = DATE('now', '-7 days')
WHERE current.snapshot_date = DATE('now')
ORDER BY current.rank;
```

---

**Document Version:** 1.0
**Last Updated:** October 25, 2025
**Next Review:** November 1, 2025
**Status:** 📋 Ready for Review
