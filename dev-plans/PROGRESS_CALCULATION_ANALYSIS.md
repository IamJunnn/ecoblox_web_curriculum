# Progress Calculation Discrepancy Analysis

**Date:** October 25, 2025
**Issue:** Teacher's Student Detail page shows incorrect progress compared to Student Dashboard
**Status:** 🔍 Analysis Complete | ⏸️ Awaiting Approval to Fix

---

## Executive Summary

**Problem:** Progress percentages and XP values don't match between:
- Student Dashboard (actual/correct values)
- Teacher's Student Detail page (incorrect values)

**Root Cause:** Teacher page uses simplified calculation logic that doesn't account for:
1. Quest completion events (`quest_completed`)
2. Unique level counting (duplicates counted)
3. XP calculation from individual events
4. Different course types (quest-style vs progressive)

**Impact:** Teachers see inaccurate student progress, making it impossible to properly assess student performance.

---

## Detailed Comparison

### Student: James (ID: 17)

| Course | Student Dashboard (Correct) | Teacher Detail (Wrong) | Discrepancy |
|--------|---------------------------|----------------------|-------------|
| **Install Roblox Studio** | 100% (5/5 levels)<br>100 XP | 20% (1/5 levels)<br>100 XP | ❌ Progress: -80%<br>✅ XP: Match |
| **Studio Basics** | 33% (2/6 levels)<br>360 XP | 50% (3/6 levels)<br>300 XP | ❌ Progress: +17%<br>❌ XP: -60 |
| **Overall Progress** | 33% overall | Calculated incorrectly | ❌ Wrong |
| **Total XP** | 460 XP | Not shown correctly | ❌ Wrong |

---

## Root Cause Analysis

### Issue #1: Missing Quest Completion Check

**Install Roblox Studio (course_id=4)** is a "quest-style" course:
- Completes as a single unit when student finishes all steps
- Triggers `quest_completed` event
- Unlocks final level (level 5) upon completion
- Should show **100%** when quest is completed

**Actual Events in Database:**
```
Event: quest_completed (level 0, course_id=4)
Event: level_unlocked (level 5, course_id=4)
```

**What Student Dashboard Does (CORRECT):**
```javascript
const questCompleted = courseEvents.some(e =>
  e.event_type === 'quest_completed' ||
  e.event_type === 'course_completed'
);

if (questCompleted) {
  courseProgress = 100;  // ✅ Sets to 100%
  currentLevel = course.total_levels;  // Shows 5/5
}
```
**Result:** 100% (5/5 levels) ✅

**What Teacher Detail Does (WRONG):**
```javascript
const levelsUnlocked = courseEvents.filter(e => e.event_type === 'level_unlocked').length;
const progress = totalLevels > 0 ? Math.round((levelsUnlocked / totalLevels) * 100) : 0;
// levelsUnlocked = 1 (only level 5 unlocked)
// progress = 1/5 = 20%  ❌
```
**Result:** 20% (1/5 levels) ❌

---

### Issue #2: Duplicate Level Counting

**Studio Basics (course_id=1)** has duplicate level unlock events:
```
Event: level_unlocked (level 2, course_id=1)
Event: level_unlocked (level 2, course_id=1)  ← DUPLICATE
Event: level_unlocked (level 3, course_id=1)
```

**What Student Dashboard Does (CORRECT):**
```javascript
const levelsUnlocked = new Set(
  courseEvents
    .filter(e => e.event_type === 'level_unlocked')
    .map(e => e.level)
);
currentLevel = levelsUnlocked.size;  // Set removes duplicates
// Unique levels: {2, 3} = 2 levels
// Progress: 2/6 = 33% ✅
```
**Result:** 33% (2/6 levels) ✅

**What Teacher Detail Does (WRONG):**
```javascript
const levelsUnlocked = courseEvents.filter(e => e.event_type === 'level_unlocked').length;
// Counts all 3 events (including duplicate level 2)
// Progress: 3/6 = 50% ❌
```
**Result:** 50% (3/6 levels) ❌

---

### Issue #3: Incorrect XP Calculation

**Studio Basics** actual events:
- 8 × `step_checked` events = 8 × 20 XP = 160 XP
- 2 × `quiz_answered` (both correct) = 2 × 100 XP = 200 XP
- **Total:** 360 XP

**What Student Dashboard Does (CORRECT):**
```javascript
let courseXP = 0;
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
// Result: 8×20 + 2×100 = 360 XP ✅
```
**Result:** 360 XP ✅

**What Teacher Detail Does (WRONG):**
```javascript
const xpEarned = levelsUnlocked * 100;
// 3 level unlocks × 100 = 300 XP ❌
```
**Result:** 300 XP ❌

---

## Solution Design

### File to Modify: `teacher/js/student-detail.js`

### Function to Update: `calculateCourseStats()` (lines 208-273)

### BEFORE (Current Broken Code):

```javascript
function calculateCourseStats() {
  return allCourses.map(course => {
    // Filter events for this course
    const courseEvents = studentEvents.filter(e => e.course_id === course.id);

    // Calculate levels completed
    const levelsUnlocked = courseEvents.filter(e => e.event_type === 'level_unlocked').length;

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

    // Calculate XP earned (100 per level unlock)
    const xpEarned = levelsUnlocked * 100;  // ❌ WRONG

    // Calculate progress percentage
    const totalLevels = course.total_levels || 6;
    const progress = totalLevels > 0 ? Math.round((levelsUnlocked / totalLevels) * 100) : 0;  // ❌ WRONG

    // Determine status
    let status = 'not-started';
    if (progress === 100) status = 'completed';
    else if (progress > 0) status = 'in-progress';

    return {
      course,
      progress,
      status,
      levelsCompleted: levelsUnlocked,
      totalLevels,
      stepsCompleted,
      xpEarned,
      // ...
    };
  });
}
```

### AFTER (Fixed Code - NOT YET IMPLEMENTED):

```javascript
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

    const xpEarned = courseXP;  // ✅ Now correct

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
      progress,  // ✅ Now correct
      status,
      levelsCompleted,  // ✅ Now correct (unique count)
      totalLevels,
      stepsCompleted,
      xpEarned,  // ✅ Now correct
      timeSpentMinutes,
      quizAttempts: quizAttempts.length,
      correctQuizzes,
      quizScore: quizAttempts.length > 0 ? Math.round((correctQuizzes / quizAttempts.length) * 100) : 0,
      lastActive,
      events: courseEvents
    };
  });
}
```

---

## Expected Results After Fix

### Install Roblox Studio (course_id=4)

**Before Fix:**
- Progress: 20% (1/5 levels)
- XP: 100
- Status: In Progress

**After Fix:**
- Progress: 100% (5/5 levels) ✅
- XP: 100 ✅
- Status: Completed ✅

**Reason:** Will detect `quest_completed` event and set progress to 100%

---

### Studio Basics (course_id=1)

**Before Fix:**
- Progress: 50% (3/6 levels)
- XP: 300
- Status: In Progress

**After Fix:**
- Progress: 33% (2/6 levels) ✅
- XP: 360 ✅ (8×20 steps + 2×100 quizzes)
- Status: In Progress ✅

**Reason:**
- Will use Set to count unique levels (2, 3) = 2 levels, not 3
- Will calculate XP from events: 8 steps (160) + 2 correct quizzes (200) = 360

---

## Testing Plan

### Test Case 1: Quest-Style Course (Install Roblox Studio)
```
Input: course_id=4, has quest_completed event
Expected: 100% progress, shows as "Completed"
```

### Test Case 2: Progressive Course (Studio Basics)
```
Input: course_id=1, 3 level_unlocked events (with duplicate level 2)
Expected: 33% progress (2/6), 360 XP, shows as "In Progress"
```

### Test Case 3: Not Started Course
```
Input: course_id=2 or 3, no events
Expected: 0% progress, 0 XP, shows as "Not Started"
```

### Test Case 4: XP Calculation
```
Input: 8 steps + 2 correct quizzes
Expected: (8×20) + (2×100) = 360 XP
```

---

## Implementation Steps (When Approved)

### Step 1: Backup Current File
```bash
cp teacher/js/student-detail.js teacher/js/student-detail.js.before-progress-fix
```

### Step 2: Apply Fix to calculateCourseStats()
- Replace lines 208-273 with corrected version above
- Add Set for unique level counting
- Add quest completion check
- Add XP calculation from events

### Step 3: Test with Student James (ID: 17)
```
Open: http://localhost:8080/teacher/student-detail.html?id=17
Verify:
- Install Roblox Studio: 100% (5/5), 100 XP
- Studio Basics: 33% (2/6), 360 XP
- Overall stats match student dashboard
```

### Step 4: Test with Other Students
- Student with 0% progress (all not started)
- Student with 100% progress (all completed)
- Student with mixed progress

### Step 5: Remove Debug Code (if still present)
- Set `DEBUG_MODE = false` on line 16
- Remove temporary console.log statements
- Remove authentication bypass (restore lines 47-54)

### Step 6: Git Commit
```bash
git add teacher/js/student-detail.js
git commit -m "Fix progress calculation to match student dashboard

Fixed three critical bugs in calculateCourseStats():

1. Quest Completion: Now checks for quest_completed events and sets
   progress to 100% when detected. Fixes Install Roblox Studio showing
   20% instead of 100%.

2. Unique Level Counting: Now uses Set to count unique level unlocks,
   preventing duplicate levels from inflating progress. Fixes Studio
   Basics showing 50% instead of 33%.

3. XP Calculation: Now calculates XP from individual events (20 per
   step, 100 per correct quiz) instead of counting level unlocks.
   Fixes XP values matching student dashboard.

Testing:
- Verified with student James (id:17)
- Install Roblox Studio: 100% (5/5), 100 XP ✅
- Studio Basics: 33% (2/6), 360 XP ✅
- All progress values now match student dashboard

Files Modified:
- teacher/js/student-detail.js (calculateCourseStats function)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Database Changes Required

**NONE** ✅

All fixes are in JavaScript calculation logic only. No database schema changes, no data migrations, no API endpoint changes required.

---

## Risk Assessment

**Risk Level:** 🟢 LOW

**Why Safe:**
1. Only changes JavaScript calculation logic
2. No database changes
3. No API changes
4. Can be easily rolled back
5. Backup file created before changes

**Rollback Plan:**
```bash
# If issues occur, restore backup
cp teacher/js/student-detail.js.before-progress-fix teacher/js/student-detail.js
# OR use git
git checkout HEAD~1 teacher/js/student-detail.js
```

---

## Files Affected

### Modified:
- `teacher/js/student-detail.js` - Update `calculateCourseStats()` function (lines 208-273)

### Reference (No Changes):
- `student/js/dashboard.js` - Source of correct calculation logic
- `backend/routes.js` - API endpoints (unchanged)
- `backend/database.js` - Database queries (unchanged)

---

## Timeline Estimate

- **Backup file:** 1 minute
- **Apply fix:** 10 minutes (copy/paste + review)
- **Test with James:** 5 minutes
- **Test edge cases:** 10 minutes
- **Git commit:** 5 minutes

**Total:** 30 minutes

---

## Summary

**What's Wrong:**
- Teacher page shows 20% for Install Roblox (should be 100%)
- Teacher page shows 50% for Studio Basics (should be 33%)
- XP values don't match between views

**Why It's Wrong:**
1. Missing quest completion check
2. Counting duplicate level unlocks
3. Wrong XP calculation method

**How to Fix:**
1. Check for `quest_completed` events → set 100%
2. Use Set to count unique levels
3. Calculate XP from events (20/step, 100/quiz)

**Ready to Implement:** ✅ Yes, when approved
**Database Changes:** ❌ None required
**Risk Level:** 🟢 Low
**Time Required:** 30 minutes
