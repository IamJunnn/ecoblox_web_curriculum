-- Migration: Add teacher invitation and tracking fields
-- Date: 2025-10-28

ALTER TABLE students ADD COLUMN created_by_teacher_id INTEGER;
ALTER TABLE students ADD COLUMN invitation_token TEXT;
ALTER TABLE students ADD COLUMN is_verified INTEGER DEFAULT 0;

-- Set existing users as verified
UPDATE students SET is_verified = 1;
