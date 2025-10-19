# 03 - Tutorial Tracking Integration

## 📋 File Info
- **Order:** Third
- **Duration:** Week 2, Day 1-2
- **Dependencies:** 01_Database_Schema.md, 02_Backend_API.md (must be complete)
- **Next File:** 04_Admin_UI_Dashboard.md

---

## Overview

Add tracking code to your existing v9_game_style.html tutorial to send student progress data to the backend API.

**What you'll add:**
- Student identification form
- Progress event tracking
- API communication
- LocalStorage backup (offline support)

---

## Current Tutorial Analysis

**Your v9_game_style.html already has:**
- ✅ 6 levels with game-style progression
- ✅ Step-by-step checkboxes
- ✅ Quiz questions with validation
- ✅ XP tracking system
- ✅ Level unlocking mechanism

**What we need to add:**
- Student name/class code input
- Send events to backend API
- Store student ID in localStorage
- Backup data locally if API fails

---

## Implementation Plan

### **Step 1: Add Student Identification Form**

Add this HTML **before the header** in v9_game_style.html:

```html
<!-- Student Login Popup -->
<div id="studentLoginModal" class="modal-overlay" style="display: none;">
  <div class="modal-content">
    <h2>Welcome, Student!</h2>
    <p>Enter your information to track your progress</p>

    <form id="studentLoginForm">
      <div class="form-group">
        <label>Your Name:</label>
        <input type="text" id="studentName" required placeholder="John Doe">
      </div>

      <div class="form-group">
        <label>Class Code (optional):</label>
        <input type="text" id="classCode" placeholder="RBLX2025">
      </div>

      <button type="submit" class="btn-primary">Start Tutorial</button>
    </form>

    <p class="privacy-note">📊 Your progress will be saved and shared with your teacher</p>
  </div>
</div>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  color: #ff6b35;
  margin-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #ff6b35;
}

.btn-primary {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.privacy-note {
  margin-top: 20px;
  font-size: 13px;
  color: #666;
  text-align: center;
}
</style>
```

---

### **Step 2: Add API Configuration**

Add this JavaScript configuration section after the existing `<script>` tag:

```javascript
// ===========================
// API CONFIGURATION
// ===========================

const API_CONFIG = {
  baseURL: 'http://localhost:3000/api',  // Change this for production
  endpoints: {
    progress: '/progress',
    students: '/students',
    stats: '/stats'
  }
};

// Student session data
let studentSession = {
  id: null,
  name: null,
  classCode: null,
  startTime: null
};

// Event queue for offline support
let offlineQueue = [];
```

---

### **Step 3: Add Student Login Handler**

Add this code to handle the login form:

```javascript
// ===========================
// STUDENT LOGIN
// ===========================

// Check if student already logged in
window.addEventListener('DOMContentLoaded', () => {
  const savedStudent = localStorage.getItem('studentSession');

  if (savedStudent) {
    studentSession = JSON.parse(savedStudent);
    console.log('✅ Student session restored:', studentSession.name);
  } else {
    // Show login modal
    document.getElementById('studentLoginModal').style.display = 'flex';
  }
});

// Handle login form submission
document.getElementById('studentLoginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('studentName').value;
  const classCode = document.getElementById('classCode').value;

  // Send to API to create or get student
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.progress}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_name: name,
        class_code: classCode,
        event_type: 'session_start',
        level: 1,
        data: { timestamp: new Date().toISOString() }
      })
    });

    const result = await response.json();

    if (result.success) {
      studentSession = {
        id: result.student_id,
        name: name,
        classCode: classCode,
        startTime: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem('studentSession', JSON.stringify(studentSession));

      // Hide modal
      document.getElementById('studentLoginModal').style.display = 'none';

      console.log('✅ Student logged in:', studentSession);
    }
  } catch (error) {
    console.error('❌ Login failed:', error);
    alert('Could not connect to server. Your progress will be saved locally.');

    // Fallback: save locally without student_id
    studentSession = {
      id: `local_${Date.now()}`,
      name: name,
      classCode: classCode,
      startTime: new Date().toISOString()
    };

    localStorage.setItem('studentSession', JSON.stringify(studentSession));
    document.getElementById('studentLoginModal').style.display = 'none';
  }
});
```

---

### **Step 4: Add Progress Tracking Functions**

Add these helper functions to send events to the API:

```javascript
// ===========================
// PROGRESS TRACKING
// ===========================

// Send progress event to API
async function trackProgress(eventType, level, data = {}) {
  if (!studentSession.id) {
    console.warn('⚠️ No student session');
    return;
  }

  const event = {
    student_id: studentSession.id,
    event_type: eventType,
    level: level,
    data: data
  };

  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.progress}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });

    if (response.ok) {
      console.log(`✅ Tracked: ${eventType} - Level ${level}`);

      // Also save to localStorage backup
      saveToLocalBackup(event);
    } else {
      throw new Error('API request failed');
    }
  } catch (error) {
    console.error('❌ Failed to track progress:', error);

    // Queue for retry
    offlineQueue.push(event);
    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));

    // Save to local backup
    saveToLocalBackup(event);
  }
}

// Save event to local backup
function saveToLocalBackup(event) {
  const backup = JSON.parse(localStorage.getItem('progressBackup') || '[]');
  backup.push({
    ...event,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('progressBackup', JSON.stringify(backup));
}

// Retry offline events
async function retryOfflineQueue() {
  if (offlineQueue.length === 0) return;

  console.log(`🔄 Retrying ${offlineQueue.length} offline events...`);

  const failed = [];

  for (const event of offlineQueue) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.progress}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });

      if (!response.ok) throw new Error('Failed');

      console.log('✅ Synced offline event');
    } catch (error) {
      failed.push(event);
    }
  }

  offlineQueue = failed;
  localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));
}

// Retry every 30 seconds
setInterval(retryOfflineQueue, 30000);
```

---

### **Step 5: Update Existing Functions to Track Events**

Modify your existing functions to call `trackProgress()`:

**Update the step checkbox function:**

```javascript
function toggleStep(level, stepNum, checkbox) {
  const stepItem = checkbox.closest('.step-item');

  if (checkbox.checked) {
    stepItem.classList.add('completed');
    levelProgress[level].steps++;

    // TRACK THIS EVENT
    trackProgress('step_checked', level, { step: stepNum });
  } else {
    stepItem.classList.remove('completed');
    levelProgress[level].steps--;
  }

  if (levelProgress[level].steps === levelProgress[level].totalSteps) {
    console.log(`Level ${level} steps completed!`);
  }
}
```

**Update the quiz answer function:**

Find the code that handles quiz answers and add tracking:

```javascript
function checkQuizAnswer(level, selectedAnswer, correctAnswer) {
  const isCorrect = (selectedAnswer === correctAnswer);

  // TRACK THIS EVENT
  trackProgress('quiz_answered', level, {
    correct: isCorrect,
    answer: selectedAnswer,
    attempt: 1  // You can track attempt numbers if you want
  });

  if (isCorrect) {
    // ... existing code for correct answer ...
  } else {
    // ... existing code for wrong answer ...
  }
}
```

**Update the level unlock function:**

```javascript
function unlockLevel(levelNumber) {
  unlockedLevels.add(levelNumber);

  // TRACK THIS EVENT
  trackProgress('level_unlocked', levelNumber, {
    xp_earned: playerXP,
    total_xp: playerXP
  });

  // ... rest of your existing unlock code ...
}
```

---

### **Step 6: Add Session End Tracking**

Track when student leaves the page:

```javascript
// Track session end
window.addEventListener('beforeunload', () => {
  if (studentSession.id) {
    const duration = new Date() - new Date(studentSession.startTime);

    // Send final progress update
    navigator.sendBeacon(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.progress}`,
      JSON.stringify({
        student_id: studentSession.id,
        event_type: 'session_end',
        level: currentLevel,
        data: { duration_seconds: Math.floor(duration / 1000) }
      })
    );
  }
});
```

---

## Testing the Integration

### **Step 1: Start backend server**

```bash
cd backend
node server.js
```

Should see: `✅ Server running on http://localhost:3000`

---

### **Step 2: Open tutorial in browser**

Open `v9_game_style.html` in Chrome

**Expected behavior:**
1. Login modal appears
2. Enter name "Test Student" and class code "RBLX2025"
3. Click "Start Tutorial"
4. Modal closes, tutorial loads

---

### **Step 3: Test tracking**

1. **Check step checkbox** → Open browser console (F12)
   - Should see: `✅ Tracked: step_checked - Level 1`

2. **Answer quiz** → Check console
   - Should see: `✅ Tracked: quiz_answered - Level 1`

3. **Unlock level** → Check console
   - Should see: `✅ Tracked: level_unlocked - Level 2`

---

### **Step 4: Verify in database**

```bash
cd backend
sqlite3 database.db

SELECT * FROM students WHERE name = 'Test Student';
SELECT * FROM progress_events WHERE student_id = (SELECT id FROM students WHERE name = 'Test Student');
```

**You should see:**
- Student record created
- Multiple progress_events recorded

---

### **Step 5: Test offline mode**

1. **Stop the backend server** (Ctrl+C)
2. **Open tutorial again**
3. **Complete some steps**
4. **Check localStorage:**
   ```javascript
   // In browser console
   JSON.parse(localStorage.getItem('offlineQueue'))
   ```
5. **Restart server** → Events should sync automatically in 30 seconds

---

## Production Configuration

When deploying, update the API URL:

```javascript
const API_CONFIG = {
  baseURL: process.env.API_URL || 'https://your-heroku-app.herokuapp.com/api',
  // or
  baseURL: 'https://your-backend-domain.com/api',
  // ...
};
```

**Or use relative URLs if frontend/backend on same domain:**

```javascript
const API_CONFIG = {
  baseURL: '/api',
  // ...
};
```

---

## LocalStorage Data Structure

### **studentSession**
```json
{
  "id": 1,
  "name": "Alice Smith",
  "classCode": "RBLX2025",
  "startTime": "2025-10-18T10:00:00Z"
}
```

### **progressBackup**
```json
[
  {
    "student_id": 1,
    "event_type": "step_checked",
    "level": 1,
    "data": {"step": 1},
    "timestamp": "2025-10-18T10:05:00Z"
  },
  {
    "student_id": 1,
    "event_type": "quiz_answered",
    "level": 1,
    "data": {"correct": true, "answer": "B"},
    "timestamp": "2025-10-18T10:10:00Z"
  }
]
```

### **offlineQueue**
```json
[
  {
    "student_id": 1,
    "event_type": "step_checked",
    "level": 2,
    "data": {"step": 3}
  }
]
```

---

## Common Issues

### **Issue 1: CORS Error**

**Error:** `Access to fetch has been blocked by CORS policy`

**Solution:** Make sure backend has `cors` middleware:
```javascript
// In server.js
const cors = require('cors');
app.use(cors());
```

---

### **Issue 2: Login modal doesn't appear**

**Solution:** Check browser console for errors. Make sure:
- Modal HTML is before `</body>` tag
- JavaScript runs after DOM loads
- No conflicting CSS hiding the modal

---

### **Issue 3: Events not saving**

**Solution:**
1. Check backend is running: `http://localhost:3000`
2. Check browser console for errors
3. Verify `studentSession.id` is set
4. Check network tab in DevTools

---

### **Issue 4: Offline queue not syncing**

**Solution:**
- Check `retryOfflineQueue()` is running (add console.log)
- Verify backend is accessible
- Check `offlineQueue` in localStorage

---

## Advanced Features (Optional)

### **1. Auto-save every 5 minutes**

```javascript
setInterval(() => {
  if (studentSession.id) {
    trackProgress('auto_save', currentLevel, {
      xp: playerXP,
      unlocked_levels: Array.from(unlockedLevels)
    });
  }
}, 5 * 60 * 1000);  // 5 minutes
```

---

### **2. Session timeout warning**

```javascript
let lastActivity = Date.now();

document.addEventListener('click', () => {
  lastActivity = Date.now();
});

setInterval(() => {
  const inactive = Date.now() - lastActivity;

  if (inactive > 30 * 60 * 1000) {  // 30 minutes
    alert('You\'ve been inactive for 30 minutes. Your progress is saved!');
  }
}, 60000);
```

---

### **3. Export progress button**

```javascript
function exportProgress() {
  const backup = localStorage.getItem('progressBackup');
  const blob = new Blob([backup], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `progress_${studentSession.name}_${Date.now()}.json`;
  a.click();
}
```

---

## Checklist

Before moving to next file:

- [ ] Student login modal added
- [ ] API configuration set up
- [ ] `trackProgress()` function works
- [ ] Step checkboxes trigger events
- [ ] Quiz answers trigger events
- [ ] Level unlocks trigger events
- [ ] LocalStorage backup works
- [ ] Offline queue retries work
- [ ] Tested with backend server running
- [ ] Tested with backend server stopped
- [ ] Verified data in database
- [ ] Session end tracking works

---

## Next Steps

**✅ Tutorial tracking is integrated!**

**👉 Move to:** `04_Admin_UI_Dashboard.md`

This will create the teacher dashboard to view all student progress.

---

**Document Status:** ✅ Complete
**Last Updated:** October 18, 2025
**Version:** 1.0
