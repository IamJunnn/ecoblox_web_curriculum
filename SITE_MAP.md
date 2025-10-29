# 🗺️ Roblox Studio Academy - Site Map

Complete site structure and navigation map for the Student Progress Monitoring System.

**Last Updated:** 2025-10-26
**Version:** 1.0
**Base URL (Development):** http://localhost:8080

---

## 📋 Table of Contents

1. [Public Pages](#public-pages)
2. [Student Pages](#student-pages)
3. [Teacher Pages](#teacher-pages)
4. [Admin Pages](#admin-pages)
5. [Course/Tutorial Pages](#coursetutorial-pages)
6. [Shared Resources](#shared-resources)
7. [Backend API Endpoints](#backend-api-endpoints)
8. [Access Control Matrix](#access-control-matrix)
9. [Navigation Flow](#navigation-flow)

---

## 🌐 Public Pages

### Landing Page
- **URL:** `/index.html`
- **Path:** `/Users/chrislee/Project/Web_Service/index.html`
- **Purpose:** Main entry point, login portal
- **Access:** Public (unauthenticated)
- **Features:**
  - Student login form
  - Teacher login link
  - Admin login link
  - Academy branding and welcome message
- **Navigation:**
  - Student login → `student/dashboard.html`
  - Teacher login → `teacher/index.html`
  - Admin login → `admin/index.html`

### Login Pages
- **Student Login:** Embedded in `/index.html`
- **Teacher Login:** Via auth modal in `/index.html`
- **Admin Login:** Via auth modal in `/index.html`

---

## 👨‍🎓 Student Pages

All student pages require authentication with `role: 'student'`

### Student Dashboard
- **URL:** `/student/dashboard.html`
- **Path:** `/Users/chrislee/Project/Web_Service/student/dashboard.html`
- **Purpose:** Student's main dashboard showing enrolled courses
- **Access:** Students only
- **Features:**
  - Summary stats (Progress, XP, Badges, Rank)
  - List of enrolled courses with progress bars
  - "View Progress" button for each course
  - "Continue Learning" button to open course
- **Navigation:**
  - View Progress → `student/progress.html` (own data only)
  - Continue Learning → Course tutorial page
  - Logout → `/index.html`

### Student Progress Page
- **URL:** `/student/progress.html`
- **Path:** `/Users/chrislee/Project/Web_Service/student/progress.html`
- **Purpose:** Detailed view of student's own progress across all courses
- **Access:** Students only (session-based, no URL parameters)
- **Security:** Cannot access other students' data
- **Features:**
  - Summary cards (Progress %, Total XP, Badges, Rank)
  - Progress by level for each course
  - Activity timeline chart (Chart.js)
  - Achievement badges
  - Recent activity history
- **Navigation:**
  - Back to Dashboard → `student/dashboard.html`
  - Logout → `/index.html`

### Student Assets
- **JavaScript:** `/student/js/dashboard.js`, `/student/js/progress.js`
- **CSS:** `/student/css/student.css`

---

## 👨‍🏫 Teacher Pages

All teacher pages require authentication with `role: 'teacher'` OR `role: 'admin'`

### Teacher Dashboard
- **URL:** `/teacher/index.html`
- **Path:** `/Users/chrislee/Project/Web_Service/teacher/index.html`
- **Purpose:** Teacher's main dashboard showing all students
- **Access:** Teachers and Admins
- **Features:**
  - Statistics cards (Total Students, Active Now, Avg Progress)
  - Student list table with progress bars
  - Search by name
  - Filter by class code
  - Filter by progress range (0-20%, 20-50%, 50-80%, 80-100%)
  - "View Details" button for each student
- **Data Filtering:** Shows ONLY students (excludes teachers/admins)
- **Navigation:**
  - View Details → `teacher/student-detail.html?id={student_id}`
  - Manage Students → `admin/manage-students.html`
  - Logout → `/index.html`

### Teacher Student Detail Page
- **URL:** `/teacher/student-detail.html?id={student_id}`
- **Path:** `/Users/chrislee/Project/Web_Service/teacher/student-detail.html`
- **Purpose:** Detailed view of individual student's progress across all courses
- **Access:** Teachers and Admins only
- **Security:** Students blocked with error message
- **Features:**
  - Student info header (Name, Email, Class Code)
  - Summary cards (Total XP, Courses Completed, Avg Progress, Quiz Score)
  - Accordion layout for multi-course view
  - Progress by level for each course
  - Activity timeline chart per course
  - Recent event history (last 20 events)
  - Color-coded level status (completed/in-progress/not-started)
- **Navigation:**
  - Back to Dashboard → `teacher/index.html`
  - Logout → `/index.html`

### Teacher Assets
- **JavaScript:** `/teacher/js/dashboard.js`, `/teacher/js/student-detail.js`
- **CSS:** `/teacher/css/teacher.css`

---

## 🔧 Admin Pages

All admin pages require authentication with `role: 'admin'`

### Admin Dashboard
- **URL:** `/admin/index.html`
- **Path:** `/Users/chrislee/Project/Web_Service/admin/index.html`
- **Purpose:** Admin's main dashboard showing ALL users (students, teachers, admins)
- **Access:** Admins only
- **Features:**
  - Statistics cards (Total Users, Active Now, Avg Progress)
  - User list table with color-coded role badges
    - 🔵 Student (Blue)
    - 🟢 Teacher (Green)
    - 🔴 Admin (Red)
  - Search by name
  - Filter by class code
  - Filter by progress range
  - "View Details" button for each user
- **Data Filtering:** Shows ALL users (students, teachers, admins)
- **Navigation:**
  - View Details → `admin/student-detail.html?id={user_id}`
  - Manage Students → `admin/manage-students.html`
  - Manage Teachers → `admin/manage-teachers.html`
  - Logout → `/index.html`

### Admin Student Detail Page
- **URL:** `/admin/student-detail.html?id={user_id}`
- **Path:** `/Users/chrislee/Project/Web_Service/admin/student-detail.html`
- **Purpose:** Detailed view of any user's progress
- **Access:** Admins only (Teachers also have access)
- **Features:** Same as Teacher Student Detail Page
- **Navigation:**
  - Back to Dashboard → `admin/index.html`
  - Logout → `/index.html`

### Manage Students Page
- **URL:** `/admin/manage-students.html`
- **Path:** `/Users/chrislee/Project/Web_Service/admin/manage-students.html`
- **Purpose:** CRUD operations for student accounts
- **Access:** Admins and Teachers
- **Features:**
  - Student list table (students only)
  - Add new student (name, email, class code)
  - Edit student (name, email, class code)
  - Delete student (with confirmation)
  - Search and filter
- **Navigation:**
  - Dashboard button → Returns to role-specific dashboard
    - Admin → `admin/index.html`
    - Teacher → `teacher/index.html`
  - Logout → `/index.html`

### Manage Teachers Page
- **URL:** `/admin/manage-teachers.html`
- **Path:** `/Users/chrislee/Project/Web_Service/admin/manage-teachers.html`
- **Purpose:** CRUD operations for teacher and admin accounts
- **Access:** Admins only
- **Features:**
  - Teacher/Admin list table with role badges
  - Add new teacher (name, email, role, class code)
  - Edit teacher (name, email, role, class code)
  - Delete teacher (with confirmation)
  - Role selector (teacher/admin)
- **Navigation:**
  - Dashboard → `admin/index.html`
  - Logout → `/index.html`

### Admin Assets
- **JavaScript:**
  - `/admin/js/dashboard.js`
  - `/admin/js/student-detail.js`
  - `/admin/admin-management.js`
- **CSS:** `/admin/style.css`

---

## 📚 Course/Tutorial Pages

### Course List (Database)
1. **Studio Basics** (ID: 1)
2. **Intermediate Building** (ID: 2)
3. **Advanced Scripting** (ID: 3)
4. **Install Roblox Studio** (ID: 4)

### Tutorial Pages

#### Studio Basics Tutorial
- **URL:** `/courses/studio-basics.html`
- **Path:** `/Users/chrislee/Project/Web_Service/courses/studio-basics.html`
- **Course ID:** 1
- **Total Levels:** 6
- **Purpose:** Interactive tutorial teaching Roblox Studio basics
- **Access:** Public (but progress tracking requires login)
- **Features:**
  - Student login modal (if not logged in)
  - 6 levels with interactive steps
  - Checkboxes for step completion (20 XP each)
  - Quiz questions (100 XP per correct answer)
  - Level unlock progression
  - Quest completion tracking
  - LocalStorage backup (offline support)
  - Retry queue for failed API calls
- **Progress Events Tracked:**
  - `session_start` - When tutorial is opened
  - `step_checked` - When checkbox is clicked
  - `quiz_answered` - When quiz is submitted
  - `level_unlocked` - When new level is unlocked
  - `quest_completed` - When final quiz is completed

#### Install Roblox Studio Tutorial
- **URL:** `/courses/install-roblox-studio.html`
- **Path:** `/Users/chrislee/Project/Web_Service/courses/install-roblox-studio.html`
- **Course ID:** 4
- **Total Levels:** 0 (single-page quest)
- **Purpose:** Guide for downloading and installing Roblox Studio
- **Access:** Public (but progress tracking requires login)
- **Features:**
  - Game-style header with orange gradient
  - Stats bar (Quest/Time/Level)
  - 5 interactive steps with checkboxes
  - Download button with official Roblox Studio logo
  - Progress saved to localStorage
  - "Quest Complete" celebration section
  - Responsive mobile design

### Course Assets
- **Template Guide:** `/TEMPLATE_CREATION_GUIDE.md`
- **Course Directory:** `/courses/`

---

## 🔗 Shared Resources

### Shared JavaScript Modules
Located in `/shared/js/`

1. **constants.js**
   - API configuration (BASE_URL, endpoints)
   - Environment settings

2. **session.js**
   - Session management functions
   - `getSession()` - Get current user session
   - `setSession()` - Save user session
   - `clearSession()` - Logout
   - `requireLogin()` - Redirect if not logged in
   - `requireRole()` - Check role permissions

3. **api-client.js**
   - HTTP client for API calls
   - `getAllStudents()` - GET /api/students
   - `getStudentById(id)` - GET /api/students/:id
   - `getStats()` - GET /api/stats
   - `trackProgress(data)` - POST /api/progress

4. **utils.js**
   - Utility functions
   - `formatRelativeTime()` - Human-readable timestamps
   - `formatDate()` - Date formatting
   - `calculateXP()` - XP calculation logic

### Shared CSS
Located in `/shared/css/`

1. **variables.css**
   - CSS custom properties
   - Color scheme (orange, purple, green, gold gradients)
   - Typography settings
   - Spacing variables

### Assets Directory
Located in `/assets/`

- **CSS:** `/assets/css/main-style.css`
- **JavaScript:** `/assets/js/auth.js`, `/assets/js/dashboard.js`
- **Images:** (if any)

---

## 🔌 Backend API Endpoints

**Base URL:** `http://localhost:3300`
**Server:** Node.js + Express.js
**Database:** SQLite3

### Authentication Endpoints

#### POST /api/auth/login
- **Purpose:** Authenticate user and return session data
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "role": "student|teacher|admin"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "session": {
      "id": 17,
      "name": "Student Name",
      "email": "user@example.com",
      "role": "student",
      "class_code": "CLASS2025"
    }
  }
  ```
- **Access:** Public

### Student Data Endpoints

#### GET /api/students
- **Purpose:** Get all users with summary stats
- **Response:**
  ```json
  {
    "students": [
      {
        "id": 17,
        "name": "Student Name",
        "email": "student@example.com",
        "role": "student",
        "class_code": "CLASS2025",
        "badges": 2,
        "progress_percentage": 33,
        "total_xp": 1080,
        "quiz_score": "6/6",
        "last_active": "2025-10-26 10:30:00"
      }
    ]
  }
  ```
- **Access:** Any authenticated user

#### GET /api/students/:id
- **Purpose:** Get detailed student progress by ID
- **Response:**
  ```json
  {
    "student": {
      "id": 17,
      "name": "Student Name",
      "email": "student@example.com",
      "role": "student",
      "class_code": "CLASS2025"
    },
    "courses": [
      {
        "course_id": 1,
        "title": "Studio Basics",
        "progress_percentage": 100,
        "current_level": 6,
        "total_levels": 6,
        "total_xp": 1080,
        "steps_completed": 36,
        "quizzes_completed": 6,
        "progress_by_level": [...]
      }
    ],
    "all_events": [...],
    "summary": {
      "total_xp": 1080,
      "courses_completed": 2,
      "avg_progress": 66,
      "quiz_score": "6/6"
    }
  }
  ```
- **Access:** Any authenticated user

#### GET /api/stats
- **Purpose:** Get overall system statistics
- **Response:**
  ```json
  {
    "total_students": 15,
    "active_now": 3,
    "timestamp": "2025-10-26T10:30:00Z"
  }
  ```
- **Access:** Any authenticated user

### Progress Tracking Endpoints

#### POST /api/progress
- **Purpose:** Save student progress event
- **Request Body:**
  ```json
  {
    "student_id": 17,
    "course_id": 1,
    "event_type": "step_checked|quiz_answered|level_unlocked|quest_completed",
    "level": 1,
    "data": {
      "step": 1,
      "correct": true,
      "xp_earned": 20
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "event_id": 833
  }
  ```
- **Access:** Any authenticated user
- **Note:** Creates new student if student_id not found

### Admin Endpoints

#### GET /api/admin/teachers
- **Purpose:** Get all teachers and admins
- **Response:**
  ```json
  {
    "teachers": [
      {
        "id": 11,
        "name": "Admin",
        "email": "admin@ecobloxacademy.com",
        "role": "admin",
        "class_code": "SYSTEM",
        "created_at": "2025-10-20 19:40:36",
        "last_active": "2025-10-26 06:42:43"
      }
    ]
  }
  ```
- **Access:** Admin only

#### POST /api/admin/student
- **Purpose:** Create new student account
- **Request Body:**
  ```json
  {
    "name": "New Student",
    "email": "student@example.com",
    "class_code": "CLASS2025"
  }
  ```
- **Access:** Admin and Teacher

#### PUT /api/admin/student/:id
- **Purpose:** Update student account
- **Access:** Admin and Teacher

#### DELETE /api/admin/student/:id
- **Purpose:** Delete student account
- **Access:** Admin and Teacher

#### POST /api/admin/teacher
- **Purpose:** Create new teacher/admin account
- **Access:** Admin only

#### PUT /api/admin/teacher/:id
- **Purpose:** Update teacher/admin account
- **Access:** Admin only

#### DELETE /api/admin/teacher/:id
- **Purpose:** Delete teacher/admin account
- **Access:** Admin only

---

## 🔐 Access Control Matrix

| Page/Endpoint | Public | Student | Teacher | Admin |
|---------------|--------|---------|---------|-------|
| `/index.html` | ✅ | ✅ | ✅ | ✅ |
| `/student/dashboard.html` | ❌ | ✅ | ❌ | ❌ |
| `/student/progress.html` | ❌ | ✅ | ❌ | ❌ |
| `/teacher/index.html` | ❌ | ❌ | ✅ | ✅ |
| `/teacher/student-detail.html` | ❌ | ❌ | ✅ | ✅ |
| `/admin/index.html` | ❌ | ❌ | ❌ | ✅ |
| `/admin/student-detail.html` | ❌ | ❌ | ✅ | ✅ |
| `/admin/manage-students.html` | ❌ | ❌ | ✅ | ✅ |
| `/admin/manage-teachers.html` | ❌ | ❌ | ❌ | ✅ |
| `/courses/*.html` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/students` | ❌ | ✅ | ✅ | ✅ |
| `GET /api/students/:id` | ❌ | ✅ | ✅ | ✅ |
| `POST /api/progress` | ❌ | ✅ | ✅ | ✅ |
| `GET /api/admin/teachers` | ❌ | ❌ | ❌ | ✅ |
| `POST /api/admin/student` | ❌ | ❌ | ✅ | ✅ |
| `PUT /api/admin/student/:id` | ❌ | ❌ | ✅ | ✅ |
| `DELETE /api/admin/student/:id` | ❌ | ❌ | ✅ | ✅ |
| `POST /api/admin/teacher` | ❌ | ❌ | ❌ | ✅ |
| `PUT /api/admin/teacher/:id` | ❌ | ❌ | ❌ | ✅ |
| `DELETE /api/admin/teacher/:id` | ❌ | ❌ | ❌ | ✅ |

---

## 🧭 Navigation Flow

### Student Journey
```
index.html (Login)
    ↓
student/dashboard.html (View courses)
    ↓
    ├─→ student/progress.html (View own progress)
    │       ↓
    │   Back to dashboard
    │
    └─→ courses/studio-basics.html (Take tutorial)
            ↓
        Complete levels → Track progress
            ↓
        Back to dashboard
```

### Teacher Journey
```
index.html (Login)
    ↓
teacher/index.html (View all students)
    ↓
    ├─→ teacher/student-detail.html?id=X (View student details)
    │       ↓
    │   Back to dashboard
    │
    └─→ admin/manage-students.html (Manage students)
            ↓
        Add/Edit/Delete students
            ↓
        Back to teacher dashboard
```

### Admin Journey
```
index.html (Login)
    ↓
admin/index.html (View all users)
    ↓
    ├─→ admin/student-detail.html?id=X (View user details)
    │       ↓
    │   Back to dashboard
    │
    ├─→ admin/manage-students.html (Manage students)
    │       ↓
    │   Add/Edit/Delete students
    │       ↓
    │   Back to admin dashboard
    │
    └─→ admin/manage-teachers.html (Manage teachers/admins)
            ↓
        Add/Edit/Delete teachers
            ↓
        Back to admin dashboard
```

---

## 📁 Directory Structure

```
/Users/chrislee/Project/Web_Service/
│
├── index.html                          # Landing page (login portal)
│
├── student/                            # Student-only pages
│   ├── dashboard.html                  # Student dashboard
│   ├── progress.html                   # Student progress details
│   ├── js/
│   │   ├── dashboard.js                # Student dashboard logic
│   │   └── progress.js                 # Student progress logic
│   └── css/
│       └── student.css                 # Student-specific styles
│
├── teacher/                            # Teacher pages
│   ├── index.html                      # Teacher dashboard
│   ├── student-detail.html             # View student details
│   ├── js/
│   │   ├── dashboard.js                # Teacher dashboard logic
│   │   └── student-detail.js           # Student detail logic
│   └── css/
│       └── teacher.css                 # Teacher-specific styles
│
├── admin/                              # Admin pages
│   ├── index.html                      # Admin dashboard
│   ├── student-detail.html             # View user details
│   ├── manage-students.html            # Student CRUD
│   ├── manage-teachers.html            # Teacher CRUD
│   ├── style.css                       # Admin styles
│   ├── admin-management.js             # CRUD logic
│   └── js/
│       ├── dashboard.js                # Admin dashboard logic
│       └── student-detail.js           # Admin student detail logic
│
├── courses/                            # Tutorial pages
│   ├── studio-basics.html              # Studio Basics tutorial (Course ID: 1)
│   └── install-roblox-studio.html      # Install guide (Course ID: 4)
│
├── shared/                             # Shared modules
│   ├── js/
│   │   ├── constants.js                # API config
│   │   ├── session.js                  # Session management
│   │   ├── api-client.js               # HTTP client
│   │   └── utils.js                    # Utilities
│   └── css/
│       └── variables.css               # CSS variables
│
├── assets/                             # Legacy/shared assets
│   ├── css/
│   │   └── main-style.css
│   └── js/
│       ├── auth.js
│       └── dashboard.js
│
├── backend/                            # Backend server
│   ├── server.js                       # Express server
│   ├── routes.js                       # API routes
│   ├── database.js                     # Database helpers
│   ├── database.db                     # SQLite database
│   └── backups/                        # Database backups
│
├── dev-plans/                          # Development documentation
│   ├── 00_Project_Overview.md
│   ├── 01_Database_Schema.md
│   ├── 02_Backend_API.md
│   ├── 03_Tutorial_Tracking_Integration.md
│   ├── 04_Admin_UI_Dashboard.md
│   ├── 05_Login_Authentication.md
│   ├── 06_Deployment_Guide.md
│   ├── 07_Testing_Plan.md
│   ├── 08_Course_ID_Fix.md
│   └── 09_Phase[1-6]_Completion_Report.md
│
├── versions/                           # Old versions (historical reference)
│   ├── v1_original.html                # Original tutorial implementation
│   ├── v9_game_style.html              # Game-style tutorial (v9)
│   └── VERSION_RECOMMENDATIONS.md      # Version comparison guide
│
├── TEMPLATE_CREATION_GUIDE.md          # Tutorial template guide
├── TEST_REPORT.md                      # Testing documentation
└── SITE_MAP.md                         # This file
```

---

## 🔧 Configuration

### Backend Configuration
- **Port:** 3300
- **Database:** `/backend/database.db` (SQLite3)
- **Environment:** Development

### Frontend Configuration
- **Development Server:** http://localhost:8080
- **API Base URL:** http://localhost:3300
- **Session Storage:** localStorage

### Database Schema

#### students Table
- `id` INTEGER PRIMARY KEY
- `name` TEXT
- `email` TEXT UNIQUE
- `password` TEXT
- `role` TEXT (student|teacher|admin)
- `class_code` TEXT
- `created_at` TIMESTAMP
- `last_active` TIMESTAMP

#### progress_events Table
- `id` INTEGER PRIMARY KEY
- `student_id` INTEGER (FK → students.id)
- `course_id` INTEGER (FK → courses.id)
- `event_type` TEXT (session_start|step_checked|quiz_answered|level_unlocked|quest_completed)
- `level` INTEGER
- `data` TEXT (JSON)
- `timestamp` TIMESTAMP

#### courses Table
- `id` INTEGER PRIMARY KEY
- `title` TEXT
- `description` TEXT
- `total_levels` INTEGER
- `url` TEXT
- `display_order` INTEGER
- `created_at` TIMESTAMP

---

## 📝 Notes

### Security Features
1. **Role-Based Access Control (RBAC)**
   - Students can only view their own progress
   - Teachers can view all students (not other teachers/admins)
   - Admins have full access to all features

2. **Session Management**
   - Sessions stored in localStorage
   - Session validation on all protected pages
   - Automatic redirect to login if unauthorized

3. **URL Parameter Protection**
   - Student progress page uses session ID only (no URL parameters)
   - Cannot manipulate URL to access other students' data
   - Teacher/Admin pages validate role before allowing access

### Progress Calculation Logic
- **Step Completion:** 20 XP per step
- **Quiz Correct Answer:** 100 XP per correct answer
- **Level Unlock:** Triggered when all steps and quiz are completed
- **Quest Completion:** Triggered when final level is completed
- **Progress Percentage:** (completed levels / total levels) × 100%
- **Special Case:** `quest_completed` event sets progress to 100%

### Data Persistence
- **Primary:** SQLite database via backend API
- **Backup:** localStorage for offline support
- **Retry Queue:** Failed API calls are queued and retried

---

## 🚀 Quick Start URLs

### Development
- **Landing Page:** http://localhost:8080/index.html
- **Student Dashboard:** http://localhost:8080/student/dashboard.html
- **Teacher Dashboard:** http://localhost:8080/teacher/index.html
- **Admin Dashboard:** http://localhost:8080/admin/index.html
- **Studio Basics Tutorial:** http://localhost:8080/courses/studio-basics.html
- **Backend API:** http://localhost:3300

### Test Accounts
See authentication documentation for test credentials.

---

## 📞 Support

For questions or issues:
1. Check development plans in `/dev-plans/`
2. Review test report in `TEST_REPORT.md`
3. Consult template guide in `TEMPLATE_CREATION_GUIDE.md`

---

**Document Version:** 1.0
**Created:** 2025-10-26
**Author:** Claude Code
**Project:** Roblox Studio Academy - Student Progress Monitoring System
