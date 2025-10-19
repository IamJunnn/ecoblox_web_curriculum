# 00 - Project Overview & Master Plan

## Project Name
**Roblox Studio Tutorial - Student Progress Monitoring System**

---

## Executive Summary

**What:** Web-based system to track student progress through the Roblox Studio UI tutorial

**Who:** Teachers/instructors monitoring 8th-10th grade students

**When:** MVP in 2-3 weeks

**Scope:** Simple version with essential features only

---

## Development Order & Dependencies

Follow these files **in numerical order**:

```
00_Project_Overview.md ................... ← YOU ARE HERE
01_Database_Schema.md .................... START HERE (Day 1-2)
02_Backend_API.md ........................ NEXT (Day 3-5)
03_Tutorial_Tracking_Integration.md ...... THEN (Week 2, Day 1-2)
04_Admin_UI_Dashboard.md ................. THEN (Week 2, Day 3-5)
05_Login_Authentication.md ............... OPTIONAL (Week 3)
06_Deployment_Guide.md ................... FINAL (Week 3)
07_Testing_Plan.md ....................... THROUGHOUT
```

### **Dependency Chart:**
```
01_Database
    ↓
02_Backend_API
    ↓
    ├── 03_Tutorial_Tracking
    └── 04_Admin_UI
            ↓
        05_Login (optional)
            ↓
        06_Deployment
```

**Rule:** Don't start a file until its dependencies are complete!

---

## Quick Reference

### **File Purposes:**

| File | What It Does | Can Skip? |
|------|--------------|-----------|
| 00_Project_Overview | Master plan & overview | No |
| 01_Database_Schema | Database tables & structure | No |
| 02_Backend_API | Server endpoints & logic | No |
| 03_Tutorial_Tracking | Add tracking to tutorial | No |
| 04_Admin_UI | Teacher dashboard pages | No |
| 05_Login_Authentication | User login system | Yes (MVP) |
| 06_Deployment | Hosting & launch | Yes (test local) |
| 07_Testing | QA & bug fixes | No |

---

## MVP Scope (Simple Version)

### **What We're Building:**

1. **Modified Tutorial** (v9_game_style.html)
   - Tracks student progress
   - Sends data to backend
   - Works offline (localStorage backup)

2. **Backend API** (Node.js + Express)
   - 4 API endpoints
   - SQLite database (2 tables)
   - Runs on localhost or Heroku

3. **Admin Dashboard** (HTML/CSS/JS)
   - Student list page
   - Student detail page
   - Basic statistics

4. **Optional:** Simple login system

---

## Technology Stack (Simple Version)

**Frontend:**
- HTML5 + CSS3
- Vanilla JavaScript (no frameworks)
- Bootstrap 5 (for styling)
- Chart.js (for simple graphs)

**Backend:**
- Node.js (v18+)
- Express.js (v4)
- SQLite3 (development)
- PostgreSQL (production - optional)

**Hosting:**
- Vercel (frontend) - FREE
- Heroku (backend) - FREE tier
- Local testing: localhost

---

## Success Criteria

**MVP is complete when:**
- ✅ Students can use tutorial and data is tracked
- ✅ Teacher can see list of students
- ✅ Teacher can view individual student progress
- ✅ Data persists (not lost on refresh)
- ✅ Works on Chrome, Firefox, Safari

---

## What We're NOT Building (Yet)

To keep it simple, we're **skipping** these for MVP:

❌ Multiple teacher accounts
❌ Class/group management
❌ Advanced charts & analytics
❌ Email notifications
❌ Export to PDF/CSV
❌ Mobile app
❌ Real-time updates
❌ Leaderboards

**These can be added in Phase 2!**

---

## Timeline Estimate

### **Week 1: Backend**
- Day 1-2: Database setup (File 01)
- Day 3-5: API development (File 02)

### **Week 2: Frontend**
- Day 1-2: Tutorial tracking (File 03)
- Day 3-5: Admin dashboard (File 04)

### **Week 3: Polish & Deploy**
- Day 1-2: Testing (File 07)
- Day 3-4: Bug fixes
- Day 5: Deployment (File 06)

**Total: 2-3 weeks part-time**

---

## Resource Requirements

### **Development:**
- 1 Developer (you or hired)
- Computer with Node.js installed
- Text editor (VS Code recommended)
- Web browser for testing

### **Hosting:**
- GitHub account (free)
- Vercel account (free)
- Heroku account (free tier)

### **Budget:**
- Development: $0 (DIY) or $3,000-6,000 (hire)
- Hosting: $0-30/month
- Tools: $0 (all free)

---

## Getting Started Checklist

Before you begin development:

- [ ] Read this file (00_Project_Overview.md)
- [ ] Review all 7 plan files briefly
- [ ] Install Node.js (https://nodejs.org)
- [ ] Install VS Code or text editor
- [ ] Create project folder structure
- [ ] Install Git (for version control)
- [ ] Answer the 5 key questions (see below)

---

## Key Questions to Answer First

### **1. Student Identification**
**Q:** How will you identify students?
- [ ] **Option A:** Name + Class Code (RECOMMENDED)
- [ ] **Option B:** Full login (username/password)
- [ ] **Option C:** Anonymous tracking only

**Recommendation:** Option A (simple, no passwords needed)

---

### **2. Access Control**
**Q:** Who needs access to admin dashboard?
- [ ] Just me (one teacher)
- [ ] Multiple teachers
- [ ] Teachers + parents

**Recommendation:** Start with "just me" for MVP

---

### **3. Privacy Level**
**Q:** How will this be used?
- [ ] Personal/homeschool use
- [ ] Real school/classroom
- [ ] Public website

**Note:** This affects privacy/security requirements

---

### **4. Technical Skill Level**
**Q:** What's your coding experience?
- [ ] Never coded before
- [ ] Know some HTML/CSS/JavaScript
- [ ] Comfortable with backend development
- [ ] Professional developer

**Note:** Helps me adjust complexity in instructions

---

### **5. Timeline**
**Q:** When do you need this ready?
- [ ] Just exploring/learning (no rush)
- [ ] Need by specific date: __________
- [ ] ASAP

---

## File Structure (What We'll Create)

```
Web_Service/
│
├── dev-plans/                           # ← Development plans (this folder)
│   ├── 00_Project_Overview.md          # ← YOU ARE HERE
│   ├── 01_Database_Schema.md
│   ├── 02_Backend_API.md
│   ├── 03_Tutorial_Tracking_Integration.md
│   ├── 04_Admin_UI_Dashboard.md
│   ├── 05_Login_Authentication.md
│   ├── 06_Deployment_Guide.md
│   └── 07_Testing_Plan.md
│
├── versions/
│   └── v9_game_style.html              # Current tutorial (will modify)
│
├── backend/                             # ← We'll create this
│   ├── server.js
│   ├── database.js
│   ├── routes.js
│   ├── package.json
│   └── database.db
│
├── admin/                               # ← We'll create this
│   ├── index.html
│   ├── student-detail.html
│   ├── style.css
│   └── app.js
│
└── Student_Progress_Monitoring_System_Development_Plan.md  # Original comprehensive plan
```

---

## Progress Tracking

**Mark files as you complete them:**

- [ ] 01_Database_Schema.md
- [ ] 02_Backend_API.md
- [ ] 03_Tutorial_Tracking_Integration.md
- [ ] 04_Admin_UI_Dashboard.md
- [ ] 05_Login_Authentication.md (optional)
- [ ] 06_Deployment_Guide.md
- [ ] 07_Testing_Plan.md

---

## Support & Resources

### **If You Get Stuck:**

1. **Check the specific plan file** for that component
2. **Review the comprehensive plan:** `Student_Progress_Monitoring_System_Development_Plan.md`
3. **Common issues:** See file 07_Testing_Plan.md
4. **Ask for help:** Post questions with specific file number

### **Helpful Links:**
- Node.js docs: https://nodejs.org/docs
- Express.js tutorial: https://expressjs.com/starter
- Bootstrap docs: https://getbootstrap.com/docs
- SQLite tutorial: https://www.sqlitetutorial.net/

---

## Version History

- **v1.0** - October 18, 2025 - Initial project setup
- Simple version scope defined
- 7 development plan files created

---

## Next Steps

**👉 START HERE:**

1. **Read file:** `01_Database_Schema.md`
2. **Set up database** following instructions
3. **Test database** with sample data
4. **Move to:** `02_Backend_API.md`

**🎯 Your Goal:** Complete files 01-04 for a working MVP!

---

**Document Status:** ✅ Complete - Ready to use
**Last Updated:** October 18, 2025
**Version:** 1.0
