-- Create test users for authentication testing
-- This script adds test data to the existing database

-- Clear existing test data (optional - be careful in production!)
DELETE FROM students WHERE email IN (
  'alice@school.com',
  'bob@school.com',
  'carol@school.com',
  'teacher@robloxacademy.com',
  'admin@robloxacademy.com'
);

-- Insert students with PINs
INSERT INTO students (name, email, pin_code, role, class_code, created_at, last_active)
VALUES
  ('Alice Student', 'alice@school.com', '1234', 'student', 'CLASS2025', datetime('now'), datetime('now')),
  ('Bob Student', 'bob@school.com', '5678', 'student', 'CLASS2025', datetime('now'), datetime('now')),
  ('Carol Student', 'carol@school.com', '9012', 'student', 'CLASS2025', datetime('now'), datetime('now'));

-- Insert teacher with password (password123 hashed with bcrypt)
-- Note: This is a bcrypt hash of 'password123' (60 chars)
INSERT INTO students (name, email, password_hash, role, class_code, is_verified, created_at, last_active)
VALUES
  ('Teacher Smith', 'teacher@robloxacademy.com', '$2b$10$IvOlhLA/QBRHJckEiZDOT.LSqVA4vWRJmI18cklJqqW88MSy2vU2.', 'teacher', 'CLASS2025', 1, datetime('now'), datetime('now'));

-- Insert admin with password (password123 hashed with bcrypt)
-- Note: This is a bcrypt hash of 'password123' (60 chars)
INSERT INTO students (name, email, password_hash, role, class_code, is_verified, created_at, last_active)
VALUES
  ('Admin User', 'admin@robloxacademy.com', '$2b$10$IvOlhLA/QBRHJckEiZDOT.LSqVA4vWRJmI18cklJqqW88MSy2vU2.', 'admin', 'SYSTEM', 1, datetime('now'), datetime('now'));

-- Verify the insertions
SELECT id, name, email, role, class_code,
       CASE
         WHEN pin_code IS NOT NULL THEN 'PIN: ' || pin_code
         WHEN password_hash IS NOT NULL THEN 'Has Password'
         ELSE 'No Auth'
       END as auth_type
FROM students
WHERE email IN (
  'alice@school.com',
  'bob@school.com',
  'carol@school.com',
  'teacher@robloxacademy.com',
  'admin@robloxacademy.com'
);

-- ============================================
-- Seed Courses
-- ============================================

-- Clear existing courses
DELETE FROM courses;

-- Insert courses
INSERT INTO courses (id, title, description, total_levels, url, display_order, created_at)
VALUES
  (4, '📦 Install Roblox Studio', 'Get started by installing Roblox Studio on your computer. Follow 5 simple steps with interactive checkboxes.', 5, '/courses/4', 0, datetime('now')),
  (1, 'Studio Basics', 'Welcome to your first session in Roblox Studio! Learn about the Studio interface through 6 interactive levels.', 6, '/courses/1', 1, datetime('now'));

-- Verify courses
SELECT id, title, description, total_levels, url, display_order
FROM courses
ORDER BY display_order;