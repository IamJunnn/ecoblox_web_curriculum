# 01 - Database Schema & Setup

## 📋 File Info
- **Order:** First (START HERE)
- **Duration:** Day 1-2
- **Dependencies:** None (this is the foundation)
- **Next File:** 02_Backend_API.md

---

## Overview

This file covers setting up your database with 2 simple tables to track student progress.

**What you'll create:**
- SQLite database file
- 2 tables: `students` and `progress_events`
- Sample data for testing

---

## Technology Choice

### **For Development: SQLite**
- ✅ Simple file-based database
- ✅ No installation needed
- ✅ Perfect for learning/testing
- ✅ Easy to view/edit data

### **For Production: PostgreSQL** (Later)
- Same structure, just different database
- Heroku provides free PostgreSQL
- Can migrate easily when ready

**For now: Use SQLite!**

---

## Database Schema (Simple Version)

We only need **2 tables**:

### **Table 1: students**
Stores basic student information

```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  class_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME
);
```

**Columns explained:**
- `id` - Unique student identifier (auto-generated)
- `name` - Student's name (e.g., "John Doe")
- `email` - Optional email address
- `class_code` - Class/group code (e.g., "RBLX2025")
- `created_at` - When student first started
- `last_active` - Last time student was active

---

### **Table 2: progress_events**
Stores every action a student takes

```sql
CREATE TABLE progress_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  level INTEGER,
  data TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);
```

**Columns explained:**
- `id` - Unique event identifier
- `student_id` - Which student (links to students table)
- `event_type` - What happened:
  - `'session_start'` - Student opened tutorial
  - `'step_checked'` - Student checked a checkbox
  - `'quiz_answered'` - Student answered quiz
  - `'level_unlocked'` - Student unlocked new level
- `level` - Which level (1-6)
- `data` - JSON with extra info:
  - For step: `{"step": 2}`
  - For quiz: `{"correct": true, "attempt": 1}`
- `timestamp` - When it happened

---

## Complete Database Setup Script

Create file: `backend/setup-database.js`

```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  // Table 1: Students
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      class_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active DATETIME
    )
  `);

  // Table 2: Progress Events
  db.run(`
    CREATE TABLE IF NOT EXISTS progress_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      level INTEGER,
      data TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);

  console.log('✅ Database tables created successfully!');

  // Insert sample data for testing
  insertSampleData();
});

// Sample data function
function insertSampleData() {
  // Insert 3 sample students
  const students = [
    ['Alice Smith', 'alice@school.com', 'RBLX2025'],
    ['Bob Jones', 'bob@school.com', 'RBLX2025'],
    ['Carol Lee', 'carol@school.com', 'RBLX2025']
  ];

  const stmt = db.prepare('INSERT INTO students (name, email, class_code) VALUES (?, ?, ?)');

  students.forEach(student => {
    stmt.run(student);
  });

  stmt.finalize(() => {
    console.log('✅ Sample students added!');

    // Add sample progress for Alice (completed level 1)
    addAliceProgress();
  });
}

function addAliceProgress() {
  const events = [
    [1, 'session_start', 1, null],
    [1, 'step_checked', 1, '{"step": 1}'],
    [1, 'step_checked', 1, '{"step": 2}'],
    [1, 'step_checked', 1, '{"step": 3}'],
    [1, 'step_checked', 1, '{"step": 4}'],
    [1, 'quiz_answered', 1, '{"correct": true, "attempt": 1}'],
    [1, 'level_unlocked', 2, null]
  ];

  const stmt = db.prepare(
    'INSERT INTO progress_events (student_id, event_type, level, data) VALUES (?, ?, ?, ?)'
  );

  events.forEach(event => {
    stmt.run(event);
  });

  stmt.finalize(() => {
    console.log('✅ Sample progress added for Alice!');
    console.log('\n📊 Database setup complete!');
    console.log('📁 Database file: backend/database.db\n');
    db.close();
  });
}
```

---

## Installation Steps

### **Step 1: Create backend folder**

```bash
mkdir backend
cd backend
```

### **Step 2: Initialize Node.js project**

```bash
npm init -y
```

This creates `package.json`

### **Step 3: Install SQLite**

```bash
npm install sqlite3
```

### **Step 4: Create setup script**

Copy the code above into: `backend/setup-database.js`

### **Step 5: Run the setup**

```bash
node setup-database.js
```

**You should see:**
```
✅ Database tables created successfully!
✅ Sample students added!
✅ Sample progress added for Alice!

📊 Database setup complete!
📁 Database file: backend/database.db
```

---

## Verify Database Was Created

### **Option A: Command Line (SQLite CLI)**

```bash
# Install SQLite CLI (if needed)
brew install sqlite  # Mac
# or
sudo apt install sqlite3  # Linux

# Open database
sqlite3 backend/database.db

# View tables
.tables

# View students
SELECT * FROM students;

# View progress
SELECT * FROM progress_events;

# Exit
.quit
```

### **Option B: GUI Tool** (Easier!)

**Download DB Browser for SQLite:**
- Website: https://sqlitebrowser.org/
- Free, visual interface
- Works on Mac/Windows/Linux

**Steps:**
1. Download and install
2. Open DB Browser
3. Click "Open Database"
4. Navigate to `backend/database.db`
5. Click "Browse Data" tab
6. See your tables and data!

---

## Sample Queries (Testing)

Once database is set up, try these queries:

### **Get all students:**
```sql
SELECT * FROM students;
```

**Expected result:**
```
id | name         | email              | class_code | created_at          | last_active
1  | Alice Smith  | alice@school.com   | RBLX2025   | 2025-10-18 10:00:00 | NULL
2  | Bob Jones    | bob@school.com     | RBLX2025   | 2025-10-18 10:00:00 | NULL
3  | Carol Lee    | carol@school.com   | RBLX2025   | 2025-10-18 10:00:00 | NULL
```

---

### **Get Alice's progress:**
```sql
SELECT * FROM progress_events WHERE student_id = 1;
```

**Expected result:**
```
id | student_id | event_type    | level | data                        | timestamp
1  | 1          | session_start | 1     | NULL                        | 2025-10-18 10:00:00
2  | 1          | step_checked  | 1     | {"step": 1}                 | 2025-10-18 10:01:00
3  | 1          | step_checked  | 1     | {"step": 2}                 | 2025-10-18 10:02:00
... (etc)
```

---

### **Get student summary (advanced):**
```sql
SELECT
  s.name,
  COUNT(DISTINCT pe.level) as levels_completed,
  COUNT(CASE WHEN pe.event_type = 'quiz_answered' THEN 1 END) as quizzes_taken
FROM students s
LEFT JOIN progress_events pe ON s.id = pe.student_id
WHERE s.id = 1
GROUP BY s.id;
```

**Expected result:**
```
name         | levels_completed | quizzes_taken
Alice Smith  | 2                | 1
```

---

## Helper Functions

Create file: `backend/database.js`

```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Helper: Get all students
function getAllStudents(callback) {
  db.all('SELECT * FROM students ORDER BY created_at DESC', callback);
}

// Helper: Get one student
function getStudentById(id, callback) {
  db.get('SELECT * FROM students WHERE id = ?', [id], callback);
}

// Helper: Get student's progress
function getStudentProgress(studentId, callback) {
  db.all(
    'SELECT * FROM progress_events WHERE student_id = ? ORDER BY timestamp ASC',
    [studentId],
    callback
  );
}

// Helper: Add student
function addStudent(name, email, classCode, callback) {
  db.run(
    'INSERT INTO students (name, email, class_code) VALUES (?, ?, ?)',
    [name, email, classCode],
    function(err) {
      callback(err, this.lastID);
    }
  );
}

// Helper: Add progress event
function addProgressEvent(studentId, eventType, level, data, callback) {
  db.run(
    'INSERT INTO progress_events (student_id, event_type, level, data) VALUES (?, ?, ?, ?)',
    [studentId, eventType, level, JSON.stringify(data)],
    callback
  );
}

// Helper: Update last active
function updateLastActive(studentId, callback) {
  db.run(
    'UPDATE students SET last_active = CURRENT_TIMESTAMP WHERE id = ?',
    [studentId],
    callback
  );
}

module.exports = {
  db,
  getAllStudents,
  getStudentById,
  getStudentProgress,
  addStudent,
  addProgressEvent,
  updateLastActive
};
```

---

## Testing the Database

Create file: `backend/test-database.js`

```javascript
const {
  getAllStudents,
  getStudentById,
  getStudentProgress,
  addStudent,
  addProgressEvent
} = require('./database');

console.log('🧪 Testing database...\n');

// Test 1: Get all students
console.log('Test 1: Get all students');
getAllStudents((err, students) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('✅ Found', students.length, 'students');
    students.forEach(s => console.log('  -', s.name));
  }

  // Test 2: Get Alice's progress
  console.log('\nTest 2: Get Alice\'s progress');
  getStudentProgress(1, (err, events) => {
    if (err) {
      console.error('❌ Error:', err);
    } else {
      console.log('✅ Found', events.length, 'events for Alice');
      events.forEach(e => console.log('  -', e.event_type, 'Level', e.level));
    }

    console.log('\n🎉 Database tests complete!');
  });
});
```

**Run test:**
```bash
node test-database.js
```

---

## Data Structure Examples

### **Event Type Examples:**

**Session Start:**
```json
{
  "student_id": 1,
  "event_type": "session_start",
  "level": 1,
  "data": null
}
```

**Step Checked:**
```json
{
  "student_id": 1,
  "event_type": "step_checked",
  "level": 1,
  "data": {"step": 2}
}
```

**Quiz Answered:**
```json
{
  "student_id": 1,
  "event_type": "quiz_answered",
  "level": 1,
  "data": {"correct": true, "attempt": 1, "answer": "B"}
}
```

**Level Unlocked:**
```json
{
  "student_id": 1,
  "event_type": "level_unlocked",
  "level": 2,
  "data": {"xp_earned": 100}
}
```

---

## Common Issues & Solutions

### **Issue 1: "Cannot find module 'sqlite3'"**
**Solution:**
```bash
cd backend
npm install sqlite3
```

### **Issue 2: "Database file not created"**
**Solution:** Check you're in the right folder
```bash
pwd  # Should be in backend/
ls   # Should see setup-database.js
```

### **Issue 3: "Permission denied"**
**Solution:** Make sure backend folder is writable
```bash
chmod 755 backend
```

---

## Checklist

Before moving to file 02_Backend_API.md:

- [ ] Backend folder created
- [ ] Node.js initialized (`package.json` exists)
- [ ] SQLite3 installed
- [ ] Database file created (`database.db`)
- [ ] Tables created (students, progress_events)
- [ ] Sample data inserted (3 students)
- [ ] Tested with queries (SELECT works)
- [ ] Helper functions created (`database.js`)
- [ ] Test script runs successfully

---

## Next Steps

**✅ Database is ready!**

**👉 Move to:** `02_Backend_API.md`

This will create the API endpoints that use this database.

---

**Document Status:** ✅ Complete
**Last Updated:** October 18, 2025
**Version:** 1.0
