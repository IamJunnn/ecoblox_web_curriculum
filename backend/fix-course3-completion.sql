-- Check current badges
SELECT 'Current badges:' as status;
SELECT b.id, b.badge_name, c.title as course_title
FROM student_badges b
JOIN courses c ON b.course_id = c.id
WHERE b.user_id = 24;

-- Check if course_completed event exists for course 3
SELECT 'Course 3 completion events:' as status;
SELECT id, event_type, level_number
FROM progress_events
WHERE user_id = 24 AND course_id = 3 AND event_type IN ('quest_completed', 'course_completed');

-- Create course_completed event
INSERT INTO progress_events (user_id, course_id, event_type, level_number, data, timestamp)
VALUES (
  24,
  3,
  'course_completed',
  6,
  '{"all_quizzes_correct":true,"total_levels":6,"completed_at":"2025-11-01T05:25:00.000Z"}',
  strftime('%s', 'now') * 1000
);

SELECT 'Course completion event created' as status;

-- Get course badge info
SELECT 'Course 3 badge info:' as status;
SELECT id, title, badge_name, badge_icon, badge_message
FROM courses
WHERE id = 3;

-- Create badge for course 3
INSERT INTO student_badges (user_id, course_id, badge_name, game_id)
SELECT
  24 as user_id,
  3 as course_id,
  c.badge_name,
  c.game_id
FROM courses c
WHERE c.id = 3;

SELECT 'Badge created for Studio Basics' as status;

-- Show final badges
SELECT 'Final badges:' as status;
SELECT b.id, b.badge_name, c.title as course_title
FROM student_badges b
JOIN courses c ON b.course_id = c.id
WHERE b.user_id = 24;
