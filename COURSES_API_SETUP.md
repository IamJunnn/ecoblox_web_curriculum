# Courses API Setup

## Problem Solved

The student dashboard was showing "No courses available yet" because **the backend didn't have a courses API endpoint**. The frontend was calling `/api/courses` but this endpoint didn't exist.

## Solution

Created a complete Courses module with:
- **CoursesService** - Handles course data logic
- **CoursesController** - Provides API endpoints
- **CoursesModule** - Connects everything together

## Files Created

1. **[backend/src/courses/courses.service.ts](c:\Users\Owner\Desktop\project\eco_curriculum\backend\src\courses\courses.service.ts)**
   - `getCourses(userId)` - Returns courses based on student's game enrollments
   - `getCourse(courseId)` - Returns single course details

2. **[backend/src/courses/courses.controller.ts](c:\Users\Owner\Desktop\project\eco_curriculum\backend\src\courses\courses.controller.ts)**
   - `GET /api/courses` - List all courses for authenticated user
   - `GET /api/courses/:id` - Get specific course details

3. **[backend/src/courses/courses.module.ts](c:\Users\Owner\Desktop\project\eco_curriculum\backend\src\courses\courses.module.ts)**
   - Registers the controller and service

## Files Modified

- **[backend/src/app.module.ts](c:\Users\Owner\Desktop\project\eco_curriculum\backend\src\app.module.ts)**
  - Added `CoursesModule` to imports

## How It Works

### Smart Course Filtering

The courses API automatically filters courses based on the student's game enrollments:

1. **Student requests** → `GET /api/courses`
2. **System checks** → Which games is this student enrolled in?
3. **System filters** → Only return courses from those games
4. **Student sees** → Only courses they have access to

### Example Flow

For student "Testing" (enrolled in Game 1 "Roblox Obby Adventure"):

```
Student calls: GET /api/courses
System finds: Student is enrolled in Game 1
System returns:
  - Course 1: Install Roblox Studio
  - Course 2: Create Roblox Account
  - Course 3: Studio Basics
  - Course 4: Build Your First Obby
```

## IMPORTANT: Restart Backend Server

**You MUST restart the backend server for these changes to take effect!**

```bash
# Stop the current backend server (Ctrl+C in the terminal)

# Then restart:
cd backend
npm run start:dev
```

## Testing

After restarting the backend, test the courses API:

```bash
cd backend
node test-courses-api.js
```

This will:
1. Login as student "Testing"
2. Fetch all courses for that student
3. Display the courses they have access to
4. Fetch details for the first course

Expected output:
```
📚 Found 4 courses:

1. Install Roblox Studio
   Game: Roblox Obby Adventure
   Steps: 5

2. Create Roblox Account
   Game: Roblox Obby Adventure
   Steps: 4

3. Studio Basics
   Game: Roblox Obby Adventure
   Steps: 8

4. Build Your First Obby
   Game: Roblox Obby Adventure
   Steps: 10
```

## Verifying on Dashboard

After restarting the backend:

1. Go to student dashboard: http://localhost:3000/student/dashboard
2. Refresh the page (Ctrl+R or F5)
3. The "My Courses" section should now show all 4 courses
4. Click on any course to start learning

## Security Features

- **Authentication Required** - All endpoints use `JwtAuthGuard`
- **Automatic Filtering** - Students only see courses from their enrolled games
- **User Context** - Course filtering based on JWT token user ID

## API Endpoints

### GET /api/courses
Returns all courses the authenticated user has access to.

**Request:**
```
GET /api/courses
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "Install Roblox Studio",
      "description": "Learn how to install Roblox Studio",
      "total_steps": 5,
      "total_levels": null,
      "course_order": 1,
      "game_id": 1,
      "game": {
        "id": 1,
        "name": "Roblox Obby Adventure"
      }
    },
    // ... more courses
  ]
}
```

### GET /api/courses/:id
Returns details for a specific course.

**Request:**
```
GET /api/courses/1
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "course": {
    "id": 1,
    "title": "Install Roblox Studio",
    "description": "Learn how to install Roblox Studio",
    "total_steps": 5,
    "game": {
      "id": 1,
      "name": "Roblox Obby Adventure"
    }
  }
}
```

## Troubleshooting

### Courses Still Not Showing

1. **Check backend is restarted**
   - The new CoursesModule won't load until you restart

2. **Check student is enrolled in a game**
   ```bash
   cd backend
   node check-courses-and-student.js
   ```

3. **Check browser console for errors**
   - Press F12 → Console tab
   - Look for API errors

4. **Test the API directly**
   ```bash
   cd backend
   node test-courses-api.js
   ```

### 404 Not Found Error

If you get 404 when calling `/api/courses`:
- Backend wasn't restarted
- CoursesModule not properly imported in app.module.ts

### Empty Courses Array

If API returns `{ courses: [] }`:
- Student is not enrolled in any games
- Run `node enroll-student-in-game.js` to enroll them

## Next Steps

1. **Restart backend server** (CRITICAL!)
2. **Test the API** with `test-courses-api.js`
3. **Refresh student dashboard** in browser
4. **Verify courses appear** in "My Courses" section
5. **Student can start learning!**

## Summary

The courses API is now:
- ✅ Created and configured
- ✅ Integrated with app module
- ✅ Secured with JWT authentication
- ✅ Filtering courses by student's game enrollments
- ✅ Ready to serve courses to the frontend

**After restarting the backend, students will see their courses!**
