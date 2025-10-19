# 06 - Deployment Guide

## 📋 File Info
- **Order:** Sixth (Deploy when ready)
- **Duration:** Week 3, Day 3-4
- **Dependencies:** 01-04 complete (05 optional)
- **Next File:** 07_Testing_Plan.md
- **Difficulty:** ⭐⭐⭐ Intermediate

---

## Overview

Deploy your Student Progress Monitoring System to the internet so teachers and students can access it from anywhere.

**What you'll deploy:**
- Frontend (tutorial + admin dashboard)
- Backend API server
- Database (PostgreSQL)

---

## Deployment Options

### **Recommended for MVP (FREE):**

| Component | Service | Cost | Difficulty |
|-----------|---------|------|------------|
| **Frontend** | Vercel or GitHub Pages | FREE | Easy |
| **Backend** | Heroku or Render | FREE | Medium |
| **Database** | Heroku PostgreSQL | FREE | Easy |

### **Alternative (Paid but better):**

- **DigitalOcean App Platform** - $5-12/month for everything
- **Railway** - $5/month
- **AWS/Google Cloud** - Variable (more complex)

**We'll use Heroku + Vercel for this guide (both FREE)**

---

## Part 1: Deploy Backend (Heroku)

### **Step 1: Install Heroku CLI**

**Mac:**
```bash
brew tap heroku/brew && brew install heroku
```

**Windows:**
Download from: https://devcenter.heroku.com/articles/heroku-cli

**Linux:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

**Verify installation:**
```bash
heroku --version
```

---

### **Step 2: Prepare backend for deployment**

**Update package.json:**

Add to `backend/package.json`:
```json
{
  "name": "roblox-tutorial-backend",
  "version": "1.0.0",
  "description": "Backend API for student progress monitoring",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "pg": "^8.11.0",
    "dotenv": "^16.3.1"
  }
}
```

---

### **Step 3: Switch to PostgreSQL**

Heroku doesn't support SQLite. We need PostgreSQL.

**Install PostgreSQL driver:**
```bash
cd backend
npm install pg
```

**Create new file: `backend/database-pg.js`**

```javascript
const { Pool } = require('pg');

// Use Heroku's DATABASE_URL in production, SQLite locally
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Helper: Get all students
async function getAllStudents() {
  const result = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
  return result.rows;
}

// Helper: Get one student
async function getStudentById(id) {
  const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
  return result.rows[0];
}

// Helper: Get student's progress
async function getStudentProgress(studentId) {
  const result = await pool.query(
    'SELECT * FROM progress_events WHERE student_id = $1 ORDER BY timestamp ASC',
    [studentId]
  );
  return result.rows;
}

// Helper: Add student
async function addStudent(name, email, classCode) {
  const result = await pool.query(
    'INSERT INTO students (name, email, class_code) VALUES ($1, $2, $3) RETURNING id',
    [name, email, classCode]
  );
  return result.rows[0].id;
}

// Helper: Add progress event
async function addProgressEvent(studentId, eventType, level, data) {
  await pool.query(
    'INSERT INTO progress_events (student_id, event_type, level, data) VALUES ($1, $2, $3, $4)',
    [studentId, eventType, level, JSON.stringify(data)]
  );
}

// Helper: Update last active
async function updateLastActive(studentId) {
  await pool.query(
    'UPDATE students SET last_active = CURRENT_TIMESTAMP WHERE id = $1',
    [studentId]
  );
}

module.exports = {
  pool,
  getAllStudents,
  getStudentById,
  getStudentProgress,
  addStudent,
  addProgressEvent,
  updateLastActive
};
```

---

### **Step 4: Update routes.js for async/await**

Update `backend/routes.js` to use async/await instead of callbacks:

```javascript
const express = require('express');
const router = express.Router();
const db = require('./database-pg');  // Use PostgreSQL version

// ==========================
// ENDPOINT 1: POST /api/progress
// ==========================
router.post('/progress', async (req, res) => {
  try {
    const { student_id, student_name, class_code, event_type, level, data } = req.body;

    if (!event_type) {
      return res.status(400).json({ error: 'event_type is required' });
    }

    let studentId = student_id;

    // Create new student if needed
    if (!studentId && student_name) {
      studentId = await db.addStudent(student_name, null, class_code);
    }

    // Save progress event
    await db.addProgressEvent(studentId, event_type, level, data);
    await db.updateLastActive(studentId);

    res.json({
      success: true,
      student_id: studentId,
      message: 'Progress saved'
    });

  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// ==========================
// ENDPOINT 2: GET /api/students
// ==========================
router.get('/students', async (req, res) => {
  try {
    const students = await db.getAllStudents();

    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const events = await db.getStudentProgress(student.id);
        const stats = calculateStudentStats(events);

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          class_code: student.class_code,
          created_at: student.created_at,
          last_active: student.last_active,
          ...stats
        };
      })
    );

    res.json({ students: studentsWithStats });

  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// ==========================
// ENDPOINT 3: GET /api/students/:id
// ==========================
router.get('/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await db.getStudentById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const events = await db.getStudentProgress(studentId);
    const progressByLevel = organizeProgressByLevel(events);

    res.json({
      student: student,
      progress_by_level: progressByLevel,
      all_events: events,
      summary: calculateStudentStats(events)
    });

  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// ==========================
// ENDPOINT 4: GET /api/stats
// ==========================
router.get('/stats', async (req, res) => {
  try {
    const students = await db.getAllStudents();

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

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Helper functions (same as before)
function calculateStudentStats(events) {
  // ... (same as 02_Backend_API.md)
}

function organizeProgressByLevel(events) {
  // ... (same as 02_Backend_API.md)
}

module.exports = router;
```

---

### **Step 5: Initialize Git repository**

```bash
cd backend

git init
git add .
git commit -m "Initial commit - Backend API"
```

---

### **Step 6: Create Heroku app**

```bash
heroku login
heroku create roblox-tutorial-backend  # Choose your own unique name

# Add PostgreSQL database
heroku addons:create heroku-postgresql:essential-0
```

This creates a FREE PostgreSQL database and sets `DATABASE_URL` environment variable.

---

### **Step 7: Create database tables**

Create file: `backend/init-db.sql`

```sql
-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  class_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP
);

-- Create progress_events table
CREATE TABLE IF NOT EXISTS progress_events (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  level INTEGER,
  data TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Insert sample data
INSERT INTO students (name, email, class_code) VALUES
  ('Alice Smith', 'alice@school.com', 'RBLX2025'),
  ('Bob Jones', 'bob@school.com', 'RBLX2025'),
  ('Carol Lee', 'carol@school.com', 'RBLX2025');
```

**Run it on Heroku:**
```bash
heroku pg:psql < init-db.sql
```

---

### **Step 8: Deploy to Heroku**

```bash
git push heroku main
# or if using master branch:
# git push heroku master
```

**Check if it's running:**
```bash
heroku logs --tail
heroku open
```

**Test the API:**
```bash
curl https://your-app-name.herokuapp.com/api/students
```

---

### **Step 9: Set environment variables (optional)**

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
```

---

## Part 2: Deploy Frontend (Vercel)

### **Step 1: Prepare frontend files**

Create this structure:
```
frontend/
├── index.html           # Tutorial (v9_game_style.html)
├── admin/
│   ├── index.html
│   ├── student-detail.html
│   ├── style.css
│   └── app.js
└── vercel.json
```

**Copy v9_game_style.html to frontend/index.html**

---

### **Step 2: Update API URL**

In tutorial and admin JavaScript files, update API URL:

```javascript
const API_CONFIG = {
  baseURL: 'https://your-heroku-app.herokuapp.com/api',  // ← UPDATE THIS
  endpoints: {
    // ...
  }
};
```

---

### **Step 3: Create vercel.json**

Create file: `frontend/vercel.json`

```json
{
  "rewrites": [
    { "source": "/admin/(.*)", "destination": "/admin/$1" },
    { "source": "/(.*)", "destination": "/$1" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

---

### **Step 4: Install Vercel CLI**

```bash
npm install -g vercel
```

---

### **Step 5: Deploy to Vercel**

```bash
cd frontend

vercel login
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - What's your project's name? roblox-tutorial
# - In which directory is your code located? ./
```

**Your site is now live at:** `https://roblox-tutorial.vercel.app`

---

### **Step 6: Set up custom domain (optional)**

1. **In Vercel dashboard:**
   - Go to Settings → Domains
   - Add your domain (e.g., tutorial.yourschool.com)

2. **In your domain registrar:**
   - Add CNAME record pointing to `cname.vercel-dns.com`

---

## Alternative: GitHub Pages (Free)

### **Step 1: Create repository**

```bash
cd frontend
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/roblox-tutorial.git
git push -u origin main
```

---

### **Step 2: Enable GitHub Pages**

1. Go to repo Settings
2. Pages → Source → main branch
3. Save

**Your site will be at:** `https://yourusername.github.io/roblox-tutorial`

---

### **Step 3: Update API URL**

Since GitHub Pages is static only, your backend must be on Heroku.

Update `API_CONFIG.baseURL` to your Heroku URL.

---

## Part 3: Database Migration

### **Migrate SQLite data to PostgreSQL**

If you have existing SQLite data:

**Step 1: Export SQLite data**

```bash
cd backend
sqlite3 database.db .dump > data.sql
```

**Step 2: Convert to PostgreSQL format**

Edit `data.sql`:
- Change `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
- Remove SQLite-specific commands
- Adjust syntax if needed

**Step 3: Import to Heroku**

```bash
heroku pg:psql < data.sql
```

---

## Production Checklist

### **Security:**
- [ ] Changed all default passwords
- [ ] Using HTTPS (Heroku/Vercel provide this)
- [ ] Set up CORS properly
- [ ] Environment variables secured
- [ ] Database credentials not in code
- [ ] Added rate limiting (optional)

### **Performance:**
- [ ] Minified CSS/JS (optional)
- [ ] Compressed images
- [ ] Database indexes added
- [ ] Caching configured (optional)

### **Monitoring:**
- [ ] Set up error logging
- [ ] Monitor Heroku logs
- [ ] Set up uptime monitoring (UptimeRobot - free)

### **Backup:**
- [ ] Database backup enabled
- [ ] Code pushed to GitHub
- [ ] Documentation updated

---

## Environment Variables

### **Heroku:**

```bash
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=<auto-set-by-heroku>
heroku config:set JWT_SECRET=your-secret-key
heroku config:set FRONTEND_URL=https://your-vercel-app.vercel.app
```

### **Vercel:**

In Vercel dashboard → Settings → Environment Variables:
- `VITE_API_URL` = `https://your-heroku-app.herokuapp.com/api`

---

## Troubleshooting

### **Issue 1: Heroku app crashes**

```bash
heroku logs --tail
```

Common causes:
- Missing dependencies in package.json
- Database connection error
- Port not set correctly (use `process.env.PORT`)

---

### **Issue 2: CORS errors**

Make sure backend has:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://your-vercel-app.vercel.app'
}));
```

---

### **Issue 3: Database connection fails**

```bash
heroku pg:info
heroku pg:psql
```

Test connection manually.

---

### **Issue 4: Vercel build fails**

Check build logs in Vercel dashboard.

Make sure all file paths are correct.

---

## Cost Breakdown

### **FREE Tier (Recommended for MVP):**

| Service | Free Tier Limits | Cost |
|---------|------------------|------|
| **Heroku** | 1000 dyno hours/month | FREE |
| **Heroku PostgreSQL** | 10,000 rows | FREE |
| **Vercel** | 100 GB bandwidth | FREE |
| **Total** | Good for 50-100 students | **$0/month** |

### **When to Upgrade:**

- **100+ active students:** Upgrade Heroku to Hobby ($7/month)
- **10,000+ rows:** Upgrade database to Standard ($9/month)
- **Need custom domain:** Keep Vercel free, just add CNAME

**Estimated cost for 500 students:** $16-20/month

---

## Monitoring & Maintenance

### **1. Set up monitoring**

**Heroku:**
- Enable email alerts for crashes
- Use Heroku metrics dashboard

**UptimeRobot (Free):**
- Monitor uptime
- Get email alerts if site goes down
- https://uptimerobot.com

---

### **2. Database backups**

**Manual backup:**
```bash
heroku pg:backups:capture
heroku pg:backups:download
```

**Automatic backups:**
```bash
heroku pg:backups:schedule --at '02:00 America/New_York'
```

---

### **3. View logs**

```bash
heroku logs --tail
heroku logs --ps web
```

**Install log aggregator (optional):**
- Papertrail (free tier)
- Loggly

---

### **4. Performance monitoring**

**Free tools:**
- Google Analytics
- Vercel Analytics (built-in)
- Heroku Metrics

---

## Scaling Up

### **When you outgrow free tier:**

**Option 1: Upgrade Heroku**
```bash
heroku ps:scale web=1:standard-1x
```

**Option 2: Move to DigitalOcean**
- $12/month for App Platform
- More resources
- PostgreSQL included

**Option 3: AWS/Google Cloud**
- More complex
- More control
- Variable cost

---

## Rollback & Updates

### **Deploy new version:**

```bash
# Backend
cd backend
git add .
git commit -m "Update feature X"
git push heroku main

# Frontend
cd frontend
vercel --prod
```

### **Rollback:**

```bash
# Heroku
heroku releases
heroku rollback v123

# Vercel
# Use dashboard → Deployments → Promote previous deployment
```

---

## Domain Setup (Optional)

### **Buy domain:**
- Namecheap ($10-15/year)
- Google Domains ($12/year)
- Cloudflare ($10/year)

### **Configure DNS:**

**For Vercel:**
1. Add CNAME: `www` → `cname.vercel-dns.com`
2. Add A record: `@` → Vercel IP (shown in dashboard)

**For Heroku:**
1. Add custom domain in Heroku dashboard
2. Add DNS record provided by Heroku

---

## Testing Deployment

### **Smoke test checklist:**

- [ ] Frontend loads at URL
- [ ] Tutorial displays correctly
- [ ] Student login works
- [ ] Progress tracking saves
- [ ] Admin dashboard loads
- [ ] Student list displays
- [ ] Student detail page works
- [ ] All API endpoints respond
- [ ] Database queries work
- [ ] No console errors
- [ ] Mobile responsive
- [ ] HTTPS enabled

---

## Next Steps

**✅ Deployment complete!**

**👉 Move to:** `07_Testing_Plan.md`

This will help you thoroughly test everything before launch.

---

## Quick Reference

### **Important URLs:**

```
Frontend: https://your-app.vercel.app
Backend: https://your-app.herokuapp.com
Admin: https://your-app.vercel.app/admin
API Docs: https://your-app.herokuapp.com/api
```

### **Useful Commands:**

```bash
# Heroku
heroku logs --tail
heroku restart
heroku pg:psql
heroku config

# Vercel
vercel
vercel --prod
vercel logs
```

---

**Document Status:** ✅ Complete
**Last Updated:** October 18, 2025
**Version:** 1.0
