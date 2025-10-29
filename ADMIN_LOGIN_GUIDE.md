# Admin Login Guide

## ✅ Admin Login is Now Working!

The admin authentication system has been successfully fixed and tested.

### Test Credentials

**Admin Login:**
- Email: `admin@robloxacademy.com`
- Password: `password123`

**Teacher Login:**
- Email: `teacher@robloxacademy.com`
- Password: `password123`

**Student Login (PIN-based):**
- Email: `alice@school.com` / PIN: `1234`
- Email: `bob@school.com` / PIN: `5678`
- Email: `carol@school.com` / PIN: `9012`

---

## How to Test Admin Login

### 1. Via Frontend (Recommended)

1. Open browser to: `http://localhost:3000`
2. Click the **Admin** tab
3. Enter credentials:
   - Email: `admin@robloxacademy.com`
   - Password: `password123`
4. Click "Admin Login"
5. Should redirect to: `http://localhost:3000/admin/dashboard`

### 2. Via API (Backend Testing)

Run the test script:
```bash
cd backend
node test-admin-login.js
```

Expected output:
```
✓ Login successful!
User: Admin User (admin)
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Admin Dashboard Features

Once logged in, you'll see:

### Stats Cards
- **Total Users** - Count of all users in system
- **Students** - Student count
- **Teachers** - Teacher count
- **Admins** - Admin count

### User Management Table
- View all users (students, teachers, admins)
- Filter by role
- Search by name
- View user details
- Delete users

### Quick Actions
- **Manage Students** button
- **Manage Teachers** button

### System Status
- Backend API status
- Database connection status
- Last backup timestamp

---

## Admin API Endpoints

All admin endpoints require JWT authentication with `role: "admin"`.

### Create Teacher
```bash
POST /admin/teachers
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@school.com",
  "class_code": "CLASS2025"  // optional
}
```

Response:
```json
{
  "success": true,
  "teacher": {
    "id": 6,
    "name": "Jane Doe",
    "email": "jane@school.com",
    "class_code": "CLASS2025_ABC",
    "role": "teacher",
    "is_verified": false
  },
  "invitation_token": "abc123...",
  "invitation_link": "http://localhost:3000/auth/setup-password?token=abc123..."
}
```

### List All Teachers
```bash
GET /admin/teachers
Authorization: Bearer <admin_token>
```

### Get Teacher Details
```bash
GET /admin/teachers/:id
Authorization: Bearer <admin_token>
```

Returns teacher info + list of students they created.

### Update Teacher
```bash
PUT /admin/teachers/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "class_code": "CLASS2026"
}
```

### Delete Teacher
```bash
DELETE /admin/teachers/:id
Authorization: Bearer <admin_token>
```

⚠️ Cannot delete teacher if they have students.

### System Stats
```bash
GET /admin/stats
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "success": true,
  "stats": {
    "total_teachers": 2,
    "verified_teachers": 1,
    "pending_teachers": 1,
    "total_students": 3,
    "total_admins": 1
  }
}
```

---

## Backend Server Info

- **URL**: `http://localhost:3400`
- **Status**: ✅ Running
- **Database**: SQLite (database.db)
- **Email Service**: Nodemailer (console fallback mode)

### Available Routes

**Authentication:**
- `POST /api/auth/login` - Email/password (teacher/admin)
- `POST /api/auth/student-login` - Email/PIN (students)
- `POST /api/auth/setup-password` - Teacher password setup

**Admin:**
- `POST /admin/teachers` - Create teacher
- `GET /admin/teachers` - List teachers
- `GET /admin/teachers/:id` - Get teacher
- `PUT /admin/teachers/:id` - Update teacher
- `DELETE /admin/teachers/:id` - Delete teacher
- `GET /admin/stats` - System stats

**Courses:**
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

**Progress:**
- `POST /api/progress` - Track progress event
- `GET /api/progress/student/:id` - Get student progress
- `GET /api/progress/student/:studentId/course/:courseId` - Course progress
- `GET /api/progress/leaderboard/:classCode` - Class leaderboard

---

## Troubleshooting

### Issue: "Invalid credentials"

**Solution:**
1. Make sure backend is running: `npm run start:dev`
2. Check database has correct password hash:
   ```bash
   cd backend
   node fix-admin-password.js
   ```
3. Verify credentials: `admin@robloxacademy.com` / `password123`

### Issue: 404 Not Found

**Solution:**
- Backend runs on port **3400**, not 3000
- Frontend runs on port **3000**
- Make sure both are running

### Issue: Can't access admin dashboard

**Solution:**
1. Clear browser localStorage
2. Log out and log in again
3. Check browser console for errors

---

## Next Steps

### Immediate
- ✅ Admin login working
- ✅ Admin dashboard functional
- ✅ Admin can view users

### To Implement
- [ ] Teacher Service (create/manage students)
- [ ] Student Service (view own progress)
- [ ] Connect admin dashboard to real API
- [ ] Email service configuration

---

## Color Theme

The app uses role-based colors:

- **Student**: `#6B9E3E` (Bright Green)
- **Teacher**: `#2D5016` (Dark Green)
- **Admin**: `#3CBB90` (Teal)

Icons are powered by [Lucide React](https://lucide.dev/icons/).
