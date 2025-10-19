# 05 - Login & Authentication (OPTIONAL)

## 📋 File Info
- **Order:** Fifth (OPTIONAL - Can Skip for MVP)
- **Duration:** Week 3, Day 1-2
- **Dependencies:** 01-04 (all previous files must be complete)
- **Next File:** 06_Deployment_Guide.md
- **Difficulty:** ⭐⭐⭐ Intermediate

---

## Overview

Add a simple login system to protect the admin dashboard. This is **OPTIONAL** for MVP.

**⚠️ Important Decision:**

Do you need login authentication?

- **✅ YES, if:**
  - Multiple teachers will access the dashboard
  - You're deploying publicly
  - You need to protect student data

- **❌ NO, if:**
  - Only you will use the dashboard
  - Running locally only
  - Want to keep it simple for MVP

**Recommendation:** Skip this for MVP, add it later if needed!

---

## Simple Version (Recommended)

For MVP, use a **single admin password** instead of full user accounts.

### **What we'll add:**
- Login page with password
- Session storage
- Protected admin routes
- Logout button

### **What we won't add (yet):**
- User registration
- Multiple teacher accounts
- Password reset
- Email verification

---

## Option 1: Simple Password Protection (Easy)

### **Step 1: Add login page**

Create file: `admin/login.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login</title>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="style.css">

  <style>
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    }

    .login-card {
      background: white;
      padding: 50px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 450px;
      width: 90%;
    }

    .login-card h2 {
      color: #333;
      margin-bottom: 10px;
    }

    .login-card .subtitle {
      color: #666;
      margin-bottom: 30px;
    }

    .form-control {
      padding: 12px 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .btn-login {
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .btn-login:hover {
      transform: translateY(-2px);
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 15px;
      display: none;
    }
  </style>
</head>
<body>

  <div class="login-container">
    <div class="login-card">
      <h2>🔐 Admin Login</h2>
      <p class="subtitle">Enter password to access dashboard</p>

      <div id="errorMessage" class="error-message"></div>

      <form id="loginForm">
        <input
          type="password"
          id="password"
          class="form-control"
          placeholder="Enter admin password"
          required
          autofocus
        >

        <button type="submit" class="btn-login">Login</button>
      </form>

      <p class="text-center text-muted mt-4">
        <small>Forgot password? Contact system administrator</small>
      </p>
    </div>
  </div>

  <script>
    // CHANGE THIS PASSWORD!
    const ADMIN_PASSWORD = 'roblox2025';

    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();

      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('errorMessage');

      if (password === ADMIN_PASSWORD) {
        // Store login session
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('loginTime', new Date().toISOString());

        // Redirect to dashboard
        window.location.href = 'index.html';
      } else {
        errorDiv.textContent = '❌ Incorrect password';
        errorDiv.style.display = 'block';
        document.getElementById('password').value = '';
      }
    });
  </script>

</body>
</html>
```

---

### **Step 2: Add auth check to dashboard pages**

Add this code to the **top** of `admin/app.js`:

```javascript
// ===========================
// AUTHENTICATION CHECK
// ===========================

function checkAuth() {
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');

  // Allow access only to login page if not logged in
  const currentPage = window.location.pathname;
  const isLoginPage = currentPage.includes('login.html');

  if (!isLoggedIn && !isLoginPage) {
    window.location.href = 'login.html';
    return false;
  }

  if (isLoggedIn && isLoginPage) {
    window.location.href = 'index.html';
    return false;
  }

  return true;
}

// Check auth on page load
if (!checkAuth()) {
  // Stop further execution
  throw new Error('Not authenticated');
}

// Session timeout (optional - 2 hours)
const loginTime = sessionStorage.getItem('loginTime');
if (loginTime) {
  const elapsed = Date.now() - new Date(loginTime);
  const twoHours = 2 * 60 * 60 * 1000;

  if (elapsed > twoHours) {
    logout();
  }
}

function logout() {
  sessionStorage.removeItem('adminLoggedIn');
  sessionStorage.removeItem('loginTime');
  window.location.href = 'login.html';
}
```

---

### **Step 3: Add logout button**

Update the header in `admin/index.html` and `admin/student-detail.html`:

```html
<header class="dashboard-header">
  <div class="container">
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <h1>📊 Roblox Tutorial - Progress Dashboard</h1>
        <p class="subtitle">Monitor student progress in real-time</p>
      </div>

      <button class="btn btn-outline-light" onclick="logout()">
        🚪 Logout
      </button>
    </div>
  </div>
</header>
```

---

## Option 2: Backend Authentication (More Secure)

If you want proper authentication with hashed passwords:

### **Step 1: Install bcrypt**

```bash
cd backend
npm install bcrypt jsonwebtoken
```

---

### **Step 2: Create admin table**

Add to `backend/setup-database.js`:

```javascript
db.run(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create default admin (username: admin, password: roblox2025)
const bcrypt = require('bcrypt');
const defaultPassword = 'roblox2025';

bcrypt.hash(defaultPassword, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }

  db.run(
    'INSERT OR IGNORE INTO admins (username, password_hash) VALUES (?, ?)',
    ['admin', hash],
    (err) => {
      if (err) {
        console.error('Error creating admin:', err);
      } else {
        console.log('✅ Default admin created (username: admin, password: roblox2025)');
      }
    }
  );
});
```

---

### **Step 3: Add login endpoint**

Add to `backend/routes.js`:

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key-change-this';  // CHANGE THIS!

// ==========================
// ENDPOINT 5: POST /api/login
// ==========================
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get(
    'SELECT * FROM admins WHERE username = ?',
    [username],
    (err, admin) => {
      if (err || !admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      bcrypt.compare(password, admin.password_hash, (err, match) => {
        if (err || !match) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
          { id: admin.id, username: admin.username },
          JWT_SECRET,
          { expiresIn: '2h' }
        );

        res.json({
          success: true,
          token: token,
          username: admin.username
        });
      });
    }
  );
});
```

---

### **Step 4: Add middleware to protect routes**

Add to `backend/server.js`:

```javascript
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key-change-this';

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}

// Protect admin routes
app.use('/api/students', authenticateToken);
app.use('/api/stats', authenticateToken);
```

---

### **Step 5: Update frontend to use JWT**

Update `admin/app.js`:

```javascript
// Store token after login
async function login(username, password) {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) throw new Error('Login failed');

    const data = await response.json();

    // Store token
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('username', data.username);

    window.location.href = 'index.html';

  } catch (error) {
    console.error('Login error:', error);
    alert('Invalid username or password');
  }
}

// Add token to all API requests
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('authToken');

  if (!token) {
    window.location.href = 'login.html';
    throw new Error('No auth token');
  }

  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(url, options);

  if (response.status === 401 || response.status === 403) {
    // Token expired or invalid
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
    throw new Error('Authentication failed');
  }

  return response;
}

// Update loadStudents to use authenticated fetch
async function loadStudents() {
  try {
    const response = await fetchWithAuth(`${API_CONFIG.baseURL}/students`);
    const data = await response.json();
    // ... rest of code
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## Security Best Practices

### **1. Use HTTPS in production**
Never send passwords over HTTP!

### **2. Strong password requirements**
```javascript
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
}
```

### **3. Rate limiting**
Install express-rate-limit:
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/api/login', loginLimiter, ...);
```

### **4. Environment variables**
Never hardcode passwords/secrets!

```javascript
// Use .env file
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
```

---

## Testing

### **Option 1 (Simple Password):**

1. Open `admin/login.html`
2. Enter password: `roblox2025`
3. Click Login
4. Should redirect to dashboard
5. Click Logout
6. Should return to login page

---

### **Option 2 (JWT):**

1. Create admin account in database
2. Test login endpoint:
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"roblox2025"}'
```

3. Should return JWT token
4. Use token to access protected routes:
```bash
curl http://localhost:3000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Comparison: Simple vs Backend Auth

| Feature | Simple Password | Backend JWT |
|---------|----------------|-------------|
| **Security** | Low | High |
| **Complexity** | Easy | Medium |
| **Setup Time** | 15 mins | 1-2 hours |
| **Multiple Users** | No | Yes |
| **Password Reset** | No | Can add |
| **Recommended For** | MVP, personal use | Production, multiple teachers |

---

## Password Management

### **Change default password**

**Simple version:**
```javascript
// In login.html
const ADMIN_PASSWORD = 'your-new-secure-password';
```

**Backend version:**
```javascript
// Run this once to create new admin
const bcrypt = require('bcrypt');

bcrypt.hash('new-password', 10, (err, hash) => {
  db.run(
    'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
    ['teacher1', hash]
  );
});
```

---

## Checklist

- [ ] Decided which option to use (Simple vs Backend)
- [ ] Login page created
- [ ] Auth check added to dashboard
- [ ] Logout button works
- [ ] Session/token storage works
- [ ] Protected routes work
- [ ] Tested login success
- [ ] Tested login failure
- [ ] Tested logout
- [ ] Changed default password
- [ ] Added HTTPS (production only)

---

## Common Issues

### **Issue 1: Infinite redirect loop**

**Solution:** Make sure login page is excluded from auth check:
```javascript
const isLoginPage = currentPage.includes('login.html');
if (!isLoggedIn && !isLoginPage) {
  // redirect
}
```

### **Issue 2: Token expired**

**Solution:** Implement token refresh or show friendly message:
```javascript
if (response.status === 401) {
  alert('Your session has expired. Please login again.');
  logout();
}
```

### **Issue 3: bcrypt not working on Windows**

**Solution:** Use bcryptjs instead:
```bash
npm install bcryptjs
```
```javascript
const bcrypt = require('bcryptjs');  // Same API
```

---

## Next Steps

**✅ Authentication is complete (or skipped)!**

**👉 Move to:** `06_Deployment_Guide.md`

This will show you how to deploy to production.

---

## Alternative: Use Auth Services

Instead of building your own:

**1. Auth0** (https://auth0.com)
- Free tier available
- Social login (Google, Facebook)
- Professional security

**2. Firebase Auth** (https://firebase.google.com)
- Google authentication
- Free tier generous
- Easy integration

**3. Clerk** (https://clerk.com)
- Modern UI
- Free for small projects

These are great for production but add complexity!

---

**Document Status:** ✅ Complete
**Last Updated:** October 18, 2025
**Version:** 1.0
