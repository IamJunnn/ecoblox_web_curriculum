# Shared Utilities

This folder contains shared code used by all three role-based interfaces (student, teacher, admin).

## Purpose

The shared utilities provide:
- **Code Reusability**: Common functionality used across all roles
- **Maintainability**: Single source of truth for shared logic
- **Consistency**: Unified behavior across all interfaces
- **Security**: Centralized session and API management

## File Structure

```
shared/
├── js/
│   ├── constants.js      # Configuration constants and API endpoints
│   ├── session.js        # Session management and authentication
│   ├── api-client.js     # API wrapper functions
│   └── utils.js          # Utility functions (formatting, validation, etc.)
├── css/
│   └── variables.css     # CSS variables for consistent styling
└── README.md             # This file
```

## JavaScript Modules

### constants.js

Defines all configuration constants:
- `API_CONFIG` - API base URL and endpoints
- `SESSION_KEY`, `LAST_COURSE_KEY` - LocalStorage keys
- `ROLES` - User role constants (student, teacher, admin)
- `RANK_THRESHOLDS` - XP thresholds for rank progression
- `TOTAL_LEVELS`, `STEPS_PER_LEVEL` - Level configuration

**Usage:**
```javascript
import { API_CONFIG, ROLES } from '../shared/js/constants.js';

console.log(API_CONFIG.baseURL);  // http://localhost:3300/api
console.log(ROLES.STUDENT);       // 'student'
```

### session.js

Handles all session management:
- `getSession()` - Get current user session
- `saveSession(userData)` - Save login session
- `clearSession()` - Logout and clear data
- `isLoggedIn()` - Check if user is logged in
- `getUserRole()` - Get current user's role
- `hasRole(role)` - Check if user has specific role
- `requireLogin()` - Redirect if not logged in
- `requireRole(roles, redirectUrl)` - Require specific role with redirect

**Usage:**
```javascript
import { getSession, requireRole } from '../shared/js/session.js';

// Require admin or teacher role
requireRole(['admin', 'teacher'], '../index.html');

// Get current user
const session = getSession();
console.log(session.name);  // "John Doe"
```

### api-client.js

Provides wrapper functions for all API calls:

**Generic API Functions:**
- `apiGet(endpoint)` - GET request
- `apiPost(endpoint, data)` - POST request
- `apiPut(endpoint, data)` - PUT request
- `apiDelete(endpoint)` - DELETE request

**Authentication:**
- `studentLogin(email, pin)` - Student PIN login
- `passwordLogin(email, password, role)` - Teacher/admin password login

**Student Data:**
- `getAllStudents()` - Get all students
- `getStudent(studentId)` - Get individual student
- `getStudentDashboard(studentId)` - Get dashboard data

**Progress:**
- `saveProgress(progressData)` - Save progress event

**Statistics:**
- `getStats()` - Get overall stats
- `getCourses()` - Get all courses

**Admin Functions:**
- `getTeachers()` - Get all teachers/admins
- `addStudent(data)` / `updateStudent(id, data)` / `deleteStudent(id)`
- `addTeacher(data)` / `updateTeacher(id, data)` / `deleteTeacher(id)`
- `resetStudentPIN(id)` / `resetStudentProgress(id)`

**Usage:**
```javascript
import { getAllStudents, saveProgress } from '../shared/js/api-client.js';

// Get all students
const data = await getAllStudents();
console.log(data.students);

// Save progress
await saveProgress({
  student_id: 1,
  event_type: 'quiz_answered',
  level: 2,
  data: { correct: true }
});
```

### utils.js

Common utility functions:

**Date & Time:**
- `formatRelativeTime(dateString)` - "5m ago", "2h ago"
- `formatDateTime(dateString)` - Full date and time
- `formatDate(dateString)` - Date only

**XP & Rank:**
- `calculateRank(xp)` - Get rank name from XP
- `calculateRankProgress(xp)` - Get progress to next rank

**Progress:**
- `calculateProgressPercentage(level, steps, totalLevels, stepsPerLevel)`
- `calculateBadges(xp, xpPerBadge)`

**Validation:**
- `isValidEmail(email)` - Validate email format
- `isValidPIN(pin)` - Validate 4-digit PIN
- `validatePassword(password)` - Check password strength

**String Formatting:**
- `truncate(str, maxLength)` - Truncate with ellipsis
- `capitalize(str)` - Capitalize first letter
- `toTitleCase(str)` - Convert to title case

**Array Utilities:**
- `unique(arr)` - Get unique values
- `sortBy(arr, property, ascending)` - Sort by property

**Number Formatting:**
- `formatNumber(num)` - Format with commas
- `formatPercentage(value, decimals)` - Format percentage

**Usage:**
```javascript
import { formatRelativeTime, calculateRank } from '../shared/js/utils.js';

console.log(formatRelativeTime('2025-10-21T10:00:00Z'));  // "5m ago"
console.log(calculateRank(350));  // "Intermediate"
```

## CSS Variables

### variables.css

Defines all design tokens:
- **Colors**: Primary, secondary, accent, neutral, semantic colors
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale (0.25rem to 5rem)
- **Borders**: Border radius and width values
- **Shadows**: Elevation shadows (sm, md, lg, xl)
- **Transitions**: Animation timing
- **Z-index**: Layer management

**Usage:**
```css
/* Import in your CSS file */
@import url('../shared/css/variables.css');

/* Use variables */
.my-button {
  background-color: var(--color-primary);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-normal);
}
```

## Import Guidelines

### ES6 Modules (JavaScript)

All JavaScript files use ES6 module syntax (`import`/`export`).

**HTML Setup:**
```html
<!-- Add type="module" to script tag -->
<script type="module" src="app.js"></script>
```

**JavaScript Import:**
```javascript
// Named imports (recommended)
import { getSession, requireRole } from '../shared/js/session.js';
import { getAllStudents } from '../shared/js/api-client.js';

// Import multiple items
import {
  formatRelativeTime,
  calculateRank,
  formatNumber
} from '../shared/js/utils.js';
```

### CSS Variables

```html
<!-- Link in HTML head -->
<link rel="stylesheet" href="../shared/css/variables.css">
```

## Path Reference

From different folders:

```
student/app.js  → import from '../shared/js/session.js'
teacher/app.js  → import from '../shared/js/session.js'
admin/app.js    → import from '../shared/js/session.js'
assets/js/auth.js → import from '../../shared/js/session.js'
```

## Best Practices

1. **Always use relative paths** - Ensures portability
2. **Import only what you need** - Better tree-shaking and performance
3. **Don't modify shared code for one role** - Keep it generic
4. **Add new shared utilities here** - Not in role-specific folders
5. **Document new functions** - Update this README

## Migration Guide

When migrating existing code to use shared utilities:

1. **Replace API_CONFIG declarations:**
   ```javascript
   // OLD
   const API_CONFIG = { baseURL: 'http://localhost:3300/api', ... };

   // NEW
   import { API_CONFIG } from '../shared/js/constants.js';
   ```

2. **Replace session functions:**
   ```javascript
   // OLD
   function getSession() { ... }

   // NEW
   import { getSession } from '../shared/js/session.js';
   ```

3. **Replace fetch calls with API client:**
   ```javascript
   // OLD
   const response = await fetch(`${API_CONFIG.baseURL}/students`);
   const data = await response.json();

   // NEW
   import { getAllStudents } from '../shared/js/api-client.js';
   const data = await getAllStudents();
   ```

4. **Use utility functions:**
   ```javascript
   // OLD
   const date = new Date(dateString);
   const diff = now - date;
   // ... complex date formatting logic

   // NEW
   import { formatRelativeTime } from '../shared/js/utils.js';
   const formatted = formatRelativeTime(dateString);
   ```

## Testing

To verify shared modules work correctly:
1. Open `shared/test.html` in a browser
2. Check browser console for test results
3. All tests should pass with green checkmarks

## Security Notes

- Session data is stored in localStorage (client-side)
- No sensitive data (passwords, PINs) should be stored in session
- API client does not include authentication tokens (stateless API)
- Role-based access control enforced on both client and server

## Version

- Created: 2025-10-21
- Phase: 1 of Complete Role Separation (File 09)
- Status: Initial implementation
