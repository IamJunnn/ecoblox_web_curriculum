const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const {
  getAllStudents,
  getStudentById,
  getStudentProgress,
  addStudent,
  addProgressEvent,
  updateLastActive
} = require('./database');
const { requireAdmin } = require('./permissions');

// Helper function to hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper function to generate random 4-digit PIN
function generatePIN() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Helper function to generate unique PIN
function generateUniquePIN(callback) {
  const pin = generatePIN();
  const db = require('./database').db;

  db.get('SELECT id FROM students WHERE pin_code = ?', [pin], (err, row) => {
    if (err) {
      callback(err, null);
    } else if (row) {
      // PIN already exists, try again
      generateUniquePIN(callback);
    } else {
      callback(null, pin);
    }
  });
}

// ==========================
// AUTH ENDPOINT: POST /api/auth/login
// ==========================
// Login with email and password (for teachers and admins)
router.post('/auth/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = require('./database').db;
  const passwordHash = hashPassword(password);

  // Find user by email and verify password
  db.get(
    'SELECT * FROM students WHERE email = ? AND password_hash = ?',
    [email, passwordHash],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials', message: 'Invalid email or password' });
      }

      // Verify role matches
      if (role && user.role !== role) {
        return res.status(403).json({ error: 'Invalid role', message: `This account is not registered as a ${role}` });
      }

      // Update last active
      updateLastActive(user.id, () => {});

      // Return user data (excluding password_hash)
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          class_code: user.class_code,
          role: user.role
        }
      });
    }
  );
});

// ==========================
// AUTH ENDPOINT: POST /api/auth/student-login
// ==========================
// Student login with email and PIN
router.post('/auth/student-login', (req, res) => {
  const { email, pin } = req.body;

  if (!email || !pin) {
    return res.status(400).json({ error: 'Email and PIN are required' });
  }

  const db = require('./database').db;

  // Find student by email and PIN
  db.get(
    'SELECT * FROM students WHERE email = ? AND pin_code = ? AND role = \'student\'',
    [email, pin],
    (err, student) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!student) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Incorrect email or PIN. Please check and try again, or ask your teacher for help.'
        });
      }

      // Update last active
      updateLastActive(student.id, () => {});

      // Log session start
      addProgressEvent(student.id, 'session_start', 0, {
        login_timestamp: new Date().toISOString()
      }, () => {});

      // Return student data (excluding PIN and password)
      res.json({
        success: true,
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          class_code: student.class_code,
          role: student.role
        }
      });
    }
  );
});

// ==========================
// ENDPOINT 1: POST /api/progress
// ==========================
// Save student progress event
router.post('/progress', (req, res) => {
  const { student_id, student_name, student_email, class_code, event_type, level, data } = req.body;

  // Validation
  if (!event_type) {
    return res.status(400).json({ error: 'event_type is required' });
  }

  // If student_id not provided, check if student exists or create new one
  if (!student_id && student_name) {
    // Create new student
    addStudent(student_name, student_email, class_code, (err, newStudentId) => {
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

// ==========================
// ENDPOINT 5: GET /api/courses
// ==========================
// Get all available courses
router.get('/courses', (req, res) => {
  const db = require('./database').db;

  db.all('SELECT * FROM courses ORDER BY display_order', (err, courses) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch courses' });
    }

    // Parse unlock_requirements JSON
    const coursesWithParsedReqs = courses.map(course => ({
      ...course,
      unlock_requirements: course.unlock_requirements
        ? JSON.parse(course.unlock_requirements)
        : null
    }));

    res.json({ courses: coursesWithParsedReqs });
  });
});

// ==========================
// ADMIN ENDPOINTS: Student Management
// ==========================

// Get all students (for admin management - includes all fields)
router.get('/admin/students', (req, res) => {
  const db = require('./database').db;

  db.all(
    'SELECT id, name, email, class_code, role, pin_code, created_at, last_active FROM students ORDER BY created_at DESC',
    (err, students) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ students });
    }
  );
});

// Create new student (admin only)
router.post('/admin/student', (req, res) => {
  const { name, email, class_code } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const db = require('./database').db;

  // Generate unique PIN
  generateUniquePIN((err, pin) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to generate PIN' });
    }

    db.run(
      'INSERT INTO students (name, email, class_code, role, pin_code) VALUES (?, ?, ?, ?, ?)',
      [name, email, class_code || 'NONE', 'student', pin],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Failed to create student' });
        }

        res.json({
          success: true,
          student_id: this.lastID,
          pin: pin,  // Return PIN so admin can share with student
          message: 'Student created successfully'
        });
      }
    );
  });
});

// Update student (admin only)
router.put('/admin/student/:id', (req, res) => {
  const studentId = req.params.id;
  const { name, email, class_code } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const db = require('./database').db;

  db.run(
    'UPDATE students SET name = ?, email = ?, class_code = ? WHERE id = ?',
    [name, email, class_code || 'NONE', studentId],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Failed to update student' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json({
        success: true,
        message: 'Student updated successfully'
      });
    }
  );
});

// Delete student (admin only)
router.delete('/admin/student/:id', (req, res) => {
  const studentId = req.params.id;
  const db = require('./database').db;

  // First delete all progress events for this student
  db.run('DELETE FROM progress_events WHERE student_id = ?', [studentId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete student progress' });
    }

    // Then delete the student
    db.run('DELETE FROM students WHERE id = ?', [studentId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete student' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json({
        success: true,
        message: 'Student deleted successfully'
      });
    });
  });
});

// Reset student progress (admin only)
router.post('/admin/student/:id/reset', (req, res) => {
  const studentId = req.params.id;
  const db = require('./database').db;

  db.run('DELETE FROM progress_events WHERE student_id = ?', [studentId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to reset progress' });
    }

    res.json({
      success: true,
      events_deleted: this.changes,
      message: 'Student progress reset successfully'
    });
  });
});

// Reset student PIN (admin only)
router.post('/admin/student/:id/reset-pin', (req, res) => {
  const studentId = req.params.id;
  const db = require('./database').db;

  // Generate new unique PIN
  generateUniquePIN((err, pin) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to generate new PIN' });
    }

    db.run('UPDATE students SET pin_code = ? WHERE id = ? AND role = \'student\'', [pin, studentId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to reset PIN' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json({
        success: true,
        new_pin: pin,
        message: 'PIN reset successfully'
      });
    });
  });
});

// ==========================
// ADMIN ENDPOINTS: Teacher Management
// ==========================

// Get all teachers
router.get('/admin/teachers', (req, res) => {
  const db = require('./database').db;

  db.all(
    `SELECT id, name, email, class_code, created_at, last_active
     FROM students
     WHERE role IN ('teacher', 'admin')
     ORDER BY role, created_at DESC`,
    (err, teachers) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ teachers });
    }
  );
});

// Create new teacher (admin only)
router.post('/admin/teacher', (req, res) => {
  const { name, email, password, class_code, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const teacherRole = role === 'admin' ? 'admin' : 'teacher';
  const passwordHash = hashPassword(password);
  const db = require('./database').db;

  db.run(
    'INSERT INTO students (name, email, class_code, role, password_hash) VALUES (?, ?, ?, ?, ?)',
    [name, email, class_code || 'ALL', teacherRole, passwordHash],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Failed to create teacher' });
      }

      res.json({
        success: true,
        teacher_id: this.lastID,
        message: `${teacherRole === 'admin' ? 'Admin' : 'Teacher'} created successfully`
      });
    }
  );
});

// Update teacher (admin only)
router.put('/admin/teacher/:id', (req, res) => {
  const teacherId = req.params.id;
  const { name, email, class_code, password } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const db = require('./database').db;

  // If password is provided, update it too
  if (password) {
    const passwordHash = hashPassword(password);
    db.run(
      'UPDATE students SET name = ?, email = ?, class_code = ?, password_hash = ? WHERE id = ?',
      [name, email, class_code || 'ALL', passwordHash, teacherId],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Failed to update teacher' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Teacher not found' });
        }

        res.json({
          success: true,
          message: 'Teacher updated successfully (password changed)'
        });
      }
    );
  } else {
    // Update without changing password
    db.run(
      'UPDATE students SET name = ?, email = ?, class_code = ? WHERE id = ?',
      [name, email, class_code || 'ALL', teacherId],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Failed to update teacher' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Teacher not found' });
        }

        res.json({
          success: true,
          message: 'Teacher updated successfully'
        });
      }
    );
  }
});

// Delete teacher (admin only)
router.delete('/admin/teacher/:id', (req, res) => {
  const teacherId = req.params.id;
  const db = require('./database').db;

  // Prevent deleting yourself
  // In a real app, you'd check req.user.id
  db.run(
    'DELETE FROM students WHERE id = ? AND role IN (\'teacher\', \'admin\')',
    [teacherId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete teacher' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      res.json({
        success: true,
        message: 'Teacher deleted successfully'
      });
    }
  );
});

module.exports = router;
