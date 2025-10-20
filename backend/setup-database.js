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
