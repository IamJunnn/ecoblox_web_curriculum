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
