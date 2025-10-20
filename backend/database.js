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
