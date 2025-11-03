# Student Course Setup Guide

## Problem Solved

Students weren't seeing courses on their dashboard because they weren't enrolled in any games. **Courses are organized by games**, so students must be enrolled in at least one game to see its courses.

## Current Setup

### Available Games and Courses

**Game 1: Roblox Obby Adventure** (4 courses)
- Course 1: Install Roblox Studio (5 steps)
- Course 2: Create Roblox Account (4 steps)
- Course 3: Studio Basics (8 steps)
- Course 4: Build Your First Obby (10 steps)

**Game 2: Roblox Tycoon Game** (2 courses)
- Course 5: Tycoon Basics (6 steps)
- Course 6: Money System (8 steps)

## What Was Done

1. **Checked database** - Found that student "Testing" was not enrolled in any games
2. **Created script** to automatically enroll students
3. **Enrolled student** in "Roblox Obby Adventure" (Game 1)
4. **Created class code** "DEFAULT2025" for the enrollment

## How to Enroll Students in Games

### Method 1: Automatic Enrollment (Recommended)

Run the enrollment script to enroll all unenrolled students:

```bash
cd backend
node enroll-student-in-game.js
```

This will:
- Find all students not enrolled in any games
- Enroll them in "Roblox Obby Adventure" (Game 1)
- Give them access to all 4 courses in that game
- Create a class code if needed

### Method 2: Manual Enrollment via Admin Portal

1. Go to Admin Portal: http://localhost:3000/admin
2. Click "Manage Students"
3. Find the student and click "View" or "Edit"
4. Assign them a class code (e.g., "DEFAULT2025")
5. Save changes

### Method 3: Enroll During Student Creation

When creating a new student from the admin portal:
1. Fill in student details
2. **Important**: Select a teacher or assign a class code
3. The student will be automatically enrolled in the game associated with that class code

## Verifying Enrollments

Check which students are enrolled in which games:

```bash
cd backend
node check-courses-and-student.js
```

This shows:
- All available courses
- All students and their game enrollments
- Warnings if any students are not enrolled

## How the System Works

### Course Display Logic

1. **Student logs in** → Dashboard loads
2. **System checks** → What games is the student enrolled in?
3. **System fetches** → All courses belonging to those games
4. **Dashboard shows** → All available courses from enrolled games

### Enrollment Requirements

For a student to see courses, they need:
- ✅ Valid student account
- ✅ Enrollment in at least one game
- ✅ Game must have courses

### Class Codes

Class codes are tied to specific games:
- `DEFAULT2025` → Roblox Obby Adventure (Game 1)
- Each game can have multiple class codes
- Students with the same class code are in the same "class" for leaderboards

## Troubleshooting

### Student Still Doesn't See Courses

1. **Check enrollment**:
   ```bash
   cd backend
   node check-courses-and-student.js
   ```

2. **Verify student is enrolled in a game** with courses

3. **Have student refresh** the dashboard page

4. **Check browser console** for any errors (F12 → Console tab)

### Creating New Courses

When you add new courses to the database:
1. Associate them with a game (game_id)
2. Students enrolled in that game will automatically see the new course

### Enrolling Students in Multiple Games

Students can be enrolled in multiple games to access more courses. Modify the enrollment script or use the admin portal to add additional game enrollments.

## Scripts Created

### `enroll-student-in-game.js`
Automatically enrolls all unenrolled students in the first game

### `check-courses-and-student.js`
Diagnostic script to see:
- All courses and which game they belong to
- All students and their game enrollments
- Recommendations if issues are found

## Next Steps

After enrollment:
1. **Refresh the student dashboard** - Courses should now appear
2. **Student can click on any course** to start learning
3. **Progress is tracked** automatically as they complete steps
4. **XP and badges** are awarded for completing courses

## Important Notes

- All current students have been enrolled in "Roblox Obby Adventure" (Game 1)
- They can see courses 1-4 (Install Roblox Studio, Create Account, Studio Basics, Build Your First Obby)
- To give them access to Game 2 courses (Tycoon), enroll them in that game as well
- New students created through the admin portal should be assigned a teacher or class code to avoid this issue
