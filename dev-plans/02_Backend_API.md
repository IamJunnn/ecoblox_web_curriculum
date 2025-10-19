# 02 - Backend API Development

## 📋 File Info
- **Order:** Second
- **Duration:** Day 3-5
- **Dependencies:** 01_Database_Schema.md (must be complete)
- **Next File:** 03_Tutorial_Tracking_Integration.md

---

## Overview

Build a simple Node.js/Express API server with 4 endpoints to handle student data.

**What you'll create:**
- Express.js server
- 4 API endpoints (GET and POST)
- CORS configuration
- Error handling

---

## Technology

**Framework:** Express.js
- ✅ Simple and popular
- ✅ Minimal boilerplate
- ✅ Easy to learn
- ✅ Great documentation

---

## API Endpoints (4 Total)

### **1. POST /api/progress**
Save student progress event

### **2. GET /api/students**
Get list of all students

### **3. GET /api/students/:id**
Get one student's detailed progress

### **4. GET /api/stats**
Get basic statistics

---

## Setup Steps

### **Step 1: Install Express**

```bash
cd backend
npm install express cors body-parser
```

**What these do:**
- `express` - Web server framework
- `cors` - Allow cross-origin requests
- `body-parser` - Parse JSON requests

---

### **Step 2: Create Server File**

Create file: `backend/server.js`

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simple test endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Student Progress API',
    version: '1.0',
    endpoints: [
      'POST /api/progress',
      'GET /api/students',
      'GET /api/students/:id',
      'GET /api/stats'
    ]
  });
});

// Import routes
const routes = require('./routes');
app.use('/api', routes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 API ready at http://localhost:${PORT}/api`);
});
```

---

### **Step 3: Create Routes File**

Create file: `backend/routes.js`

```javascript
const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  getStudentProgress,
  addStudent,
  addProgressEvent,
  updateLastActive
} = require('./database');

// ==========================
// ENDPOINT 1: POST /api/progress
// ==========================
// Save student progress event
router.post('/progress', (req, res) => {
  const { student_id, student_name, class_code, event_type, level, data } = req.body;

  // Validation
  if (!event_type) {
    return res.status(400).json({ error: 'event_type is required' });
  }

  // If student_id not provided, check if student exists or create new one
  if (!student_id && student_name) {
    // Create new student
    addStudent(student_name, null, class_code, (err, newStudentId) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create student' });
      }

      // Now add the progress event
      saveProgressEvent(newStudentId, event_type, level, data, res);
    });
  } else {
    // Use existing student_id
    saveProgressEvent(student_id, event_type, level, data, res);
  }
});

// Helper function to save progress
function saveProgressEvent(studentId, eventType, level, data, res) {
  addProgressEvent(studentId, eventType, level, data, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save progress' });
    }

    // Update last active time
    updateLastActive(studentId, () => {
      res.json({
        success: true,
        student_id: studentId,
        message: 'Progress saved'
      });
    });
  });
}

// ==========================
// ENDPOINT 2: GET /api/students
// ==========================
// Get all students with summary
router.get('/students', (req, res) => {
  getAllStudents((err, students) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch students' });
    }

    // For each student, calculate summary stats
    const promises = students.map(student => {
      return new Promise((resolve) => {
        getStudentProgress(student.id, (err, events) => {
          if (err) {
            resolve({ ...student, error: true });
            return;
          }

          // Calculate stats
          const stats = calculateStudentStats(events);

          resolve({
            id: student.id,
            name: student.name,
            email: student.email,
            class_code: student.class_code,
            created_at: student.created_at,
            last_active: student.last_active,
            ...stats
          });
        });
      });
    });

    Promise.all(promises).then(studentsWithStats => {
      res.json({ students: studentsWithStats });
    });
  });
});

// ==========================
// ENDPOINT 3: GET /api/students/:id
// ==========================
// Get one student's detailed progress
router.get('/students/:id', (req, res) => {
  const studentId = req.params.id;

  getStudentById(studentId, (err, student) => {
    if (err || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    getStudentProgress(studentId, (err, events) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch progress' });
      }

      // Organize events by level
      const progressByLevel = organizeProgressByLevel(events);

      res.json({
        student: student,
        progress_by_level: progressByLevel,
        all_events: events,
        summary: calculateStudentStats(events)
      });
    });
  });
});

// ==========================
// ENDPOINT 4: GET /api/stats
// ==========================
// Get basic statistics
router.get('/stats', (req, res) => {
  getAllStudents((err, students) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }

    // Calculate overall stats
    const totalStudents = students.length;
    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);

    const activeStudents = students.filter(s =>
      s.last_active && new Date(s.last_active) > oneHourAgo
    ).length;

    res.json({
      total_students: totalStudents,
      active_now: activeStudents,
      timestamp: now.toISOString()
    });
  });
});

// ==========================
// HELPER FUNCTIONS
// ==========================

// Calculate student summary stats from events
function calculateStudentStats(events) {
  if (!events || events.length === 0) {
    return {
      current_level: 0,
      progress_percentage: 0,
      total_xp: 0,
      quiz_score: 0,
      steps_completed: 0,
      time_spent_seconds: 0
    };
  }

  // Count unique levels unlocked
  const levelsUnlocked = new Set(
    events
      .filter(e => e.event_type === 'level_unlocked')
      .map(e => e.level)
  );
  const currentLevel = Math.max(...levelsUnlocked, 0);

  // Count steps completed
  const stepsCompleted = events.filter(e => e.event_type === 'step_checked').length;

  // Count quiz answers
  const quizEvents = events.filter(e => e.event_type === 'quiz_answered');
  const correctQuizzes = quizEvents.filter(e => {
    const data = JSON.parse(e.data || '{}');
    return data.correct === true;
  }).length;

  // Calculate XP (100 per correct quiz)
  const totalXP = correctQuizzes * 100;

  // Calculate progress percentage (6 levels total)
  const progressPercentage = Math.round((currentLevel / 6) * 100);

  return {
    current_level: currentLevel,
    progress_percentage: progressPercentage,
    total_xp: totalXP,
    quiz_score: `${correctQuizzes}/${quizEvents.length}`,
    steps_completed: stepsCompleted,
    levels_unlocked: levelsUnlocked.size
  };
}

// Organize events by level
function organizeProgressByLevel(events) {
  const byLevel = {};

  events.forEach(event => {
    const level = event.level || 0;

    if (!byLevel[level]) {
      byLevel[level] = {
        level: level,
        steps: [],
        quiz_attempts: [],
        status: 'not_started'
      };
    }

    if (event.event_type === 'step_checked') {
      const data = JSON.parse(event.data || '{}');
      byLevel[level].steps.push(data.step);
    } else if (event.event_type === 'quiz_answered') {
      const data = JSON.parse(event.data || '{}');
      byLevel[level].quiz_attempts.push(data);
    } else if (event.event_type === 'level_unlocked') {
      byLevel[level].status = 'completed';
    }
  });

  return byLevel;
}

module.exports = router;
```

---

## Testing the API

### **Step 1: Start the server**

```bash
cd backend
node server.js
```

**You should see:**
```
✅ Server running on http://localhost:3000
📊 API ready at http://localhost:3000/api
```

---

### **Step 2: Test in browser**

Open browser to: `http://localhost:3000`

**You should see:**
```json
{
  "message": "Student Progress API",
  "version": "1.0",
  "endpoints": [
    "POST /api/progress",
    "GET /api/students",
    "GET /api/students/:id",
    "GET /api/stats"
  ]
}
```

---

### **Step 3: Test endpoints with curl**

**Test 1: Get all students**
```bash
curl http://localhost:3000/api/students
```

**Test 2: Get one student**
```bash
curl http://localhost:3000/api/students/1
```

**Test 3: Get stats**
```bash
curl http://localhost:3000/api/stats
```

**Test 4: Save progress**
```bash
curl -X POST http://localhost:3000/api/progress \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "event_type": "step_checked",
    "level": 2,
    "data": {"step": 1}
  }'
```

---

### **Step 4: Test with Postman** (Easier!)

**Download Postman:** https://www.postman.com/downloads/

**Create requests:**
1. **GET** `http://localhost:3000/api/students`
2. **GET** `http://localhost:3000/api/students/1`
3. **GET** `http://localhost:3000/api/stats`
4. **POST** `http://localhost:3000/api/progress`
   - Body (raw JSON):
   ```json
   {
     "student_id": 1,
     "event_type": "step_checked",
     "level": 2,
     "data": {"step": 1}
   }
   ```

---

## API Documentation

### **POST /api/progress**

**Purpose:** Save student progress event

**Request Body:**
```json
{
  "student_id": 1,              // Optional: if new student, provide student_name instead
  "student_name": "John Doe",   // Required if no student_id
  "class_code": "RBLX2025",     // Optional
  "event_type": "step_checked", // Required: session_start, step_checked, quiz_answered, level_unlocked
  "level": 1,                   // Level number 1-6
  "data": {                     // Optional: extra data
    "step": 2                   // For step_checked
    // OR
    "correct": true,            // For quiz_answered
    "attempt": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "student_id": 1,
  "message": "Progress saved"
}
```

---

### **GET /api/students**

**Purpose:** Get all students with summaries

**Response:**
```json
{
  "students": [
    {
      "id": 1,
      "name": "Alice Smith",
      "email": "alice@school.com",
      "class_code": "RBLX2025",
      "created_at": "2025-10-18T10:00:00Z",
      "last_active": "2025-10-18T15:30:00Z",
      "current_level": 2,
      "progress_percentage": 33,
      "total_xp": 200,
      "quiz_score": "2/2",
      "steps_completed": 8,
      "levels_unlocked": 2
    }
  ]
}
```

---

### **GET /api/students/:id**

**Purpose:** Get detailed student progress

**Example:** `GET /api/students/1`

**Response:**
```json
{
  "student": {
    "id": 1,
    "name": "Alice Smith",
    "email": "alice@school.com",
    "class_code": "RBLX2025"
  },
  "progress_by_level": {
    "1": {
      "level": 1,
      "steps": [1, 2, 3, 4],
      "quiz_attempts": [{"correct": true, "attempt": 1}],
      "status": "completed"
    },
    "2": {
      "level": 2,
      "steps": [1, 2],
      "quiz_attempts": [],
      "status": "in_progress"
    }
  },
  "all_events": [...],
  "summary": {...}
}
```

---

### **GET /api/stats**

**Purpose:** Get basic statistics

**Response:**
```json
{
  "total_students": 25,
  "active_now": 3,
  "timestamp": "2025-10-18T15:45:00Z"
}
```

---

## Auto-Restart Server (Development)

Install `nodemon` for auto-restart on file changes:

```bash
npm install --save-dev nodemon
```

**Update package.json:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**Run in dev mode:**
```bash
npm run dev
```

Now server restarts automatically when you edit files!

---

## Environment Variables

Create file: `backend/.env`

```
PORT=3000
NODE_ENV=development
DATABASE_PATH=./database.db
```

Install dotenv:
```bash
npm install dotenv
```

**Update server.js:**
```javascript
require('dotenv').config();
const PORT = process.env.PORT || 3000;
```

---

## Error Handling

The server includes basic error handling. Common errors:

**400 Bad Request** - Missing required fields
**404 Not Found** - Student doesn't exist
**500 Server Error** - Database or server issue

---

## Common Issues

### **Issue 1: Port already in use**
**Error:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 [PID]

# Or use different port
PORT=3001 node server.js
```

### **Issue 2: CORS errors**
**Solution:** Already handled with `cors` middleware

### **Issue 3: Cannot find module**
**Solution:**
```bash
npm install
```

---

## Checklist

Before moving to next file:

- [ ] Express installed
- [ ] Server file created (`server.js`)
- [ ] Routes file created (`routes.js`)
- [ ] Server starts without errors
- [ ] Can access http://localhost:3000
- [ ] All 4 endpoints work:
  - [ ] POST /api/progress
  - [ ] GET /api/students
  - [ ] GET /api/students/:id
  - [ ] GET /api/stats
- [ ] Tested with sample data
- [ ] Nodemon installed (optional)

---

## Next Steps

**✅ Backend API is ready!**

**👉 Move to:** `03_Tutorial_Tracking_Integration.md`

This will add tracking code to your tutorial to send data to this API.

---

**Document Status:** ✅ Complete
**Last Updated:** October 18, 2025
**Version:** 1.0
