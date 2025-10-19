# 07 - Testing Plan

## 📋 File Info
- **Order:** Seventh (Ongoing throughout development)
- **Duration:** Throughout project + dedicated testing days
- **Dependencies:** Test as you build each component
- **Previous Files:** All (01-06)
- **Difficulty:** ⭐⭐ Easy to Medium

---

## Overview

Comprehensive testing plan to ensure everything works correctly before launch.

**Testing phases:**
1. **Unit Testing** - Test individual components
2. **Integration Testing** - Test components working together
3. **User Testing** - Test with real students/teachers
4. **Performance Testing** - Test under load
5. **Final QA** - Pre-launch checklist

---

## Phase 1: Database Testing

### **Test 1.1: Database Creation**

```bash
cd backend
node setup-database.js
```

**Expected results:**
- ✅ `database.db` file created
- ✅ Tables created (students, progress_events)
- ✅ Sample data inserted
- ✅ No errors in console

**Verify:**
```bash
sqlite3 database.db "SELECT * FROM students;"
sqlite3 database.db "SELECT * FROM progress_events;"
```

---

### **Test 1.2: Helper Functions**

```bash
node test-database.js
```

**Expected results:**
- ✅ `getAllStudents()` returns array
- ✅ `getStudentById()` returns student
- ✅ `getStudentProgress()` returns events
- ✅ `addStudent()` creates new student
- ✅ `addProgressEvent()` creates event

**Manual test:**
```javascript
// Create test-database.js
const db = require('./database');

async function runTests() {
  console.log('🧪 Testing database...\n');

  // Test 1: Get all students
  const students = await db.getAllStudents();
  console.assert(students.length > 0, '❌ No students found');
  console.log('✅ Test 1: Get all students');

  // Test 2: Get one student
  const student = await db.getStudentById(1);
  console.assert(student !== undefined, '❌ Student not found');
  console.log('✅ Test 2: Get student by ID');

  // Test 3: Get progress
  const progress = await db.getStudentProgress(1);
  console.assert(Array.isArray(progress), '❌ Progress not array');
  console.log('✅ Test 3: Get student progress');

  // Test 4: Add student
  const newId = await db.addStudent('Test Student', 'test@test.com', 'TEST');
  console.assert(newId > 0, '❌ Failed to create student');
  console.log('✅ Test 4: Add new student');

  // Test 5: Add progress event
  await db.addProgressEvent(newId, 'step_checked', 1, { step: 1 });
  console.log('✅ Test 5: Add progress event');

  console.log('\n🎉 All database tests passed!');
}

runTests().catch(console.error);
```

---

## Phase 2: Backend API Testing

### **Test 2.1: Server Start**

```bash
cd backend
node server.js
```

**Expected results:**
- ✅ Server starts without errors
- ✅ Shows: `✅ Server running on http://localhost:3000`
- ✅ No port conflicts

**Test root endpoint:**
```bash
curl http://localhost:3000
```

Expected JSON response with endpoints list.

---

### **Test 2.2: GET /api/students**

```bash
curl http://localhost:3000/api/students
```

**Expected results:**
- ✅ Status 200
- ✅ Returns JSON object with `students` array
- ✅ Each student has: id, name, email, class_code, current_level, progress_percentage, total_xp
- ✅ Stats calculated correctly

**Example response:**
```json
{
  "students": [
    {
      "id": 1,
      "name": "Alice Smith",
      "email": "alice@school.com",
      "class_code": "RBLX2025",
      "current_level": 2,
      "progress_percentage": 33,
      "total_xp": 200
    }
  ]
}
```

---

### **Test 2.3: GET /api/students/:id**

```bash
curl http://localhost:3000/api/students/1
```

**Expected results:**
- ✅ Status 200
- ✅ Returns student object
- ✅ Returns progress_by_level object
- ✅ Returns all_events array
- ✅ Returns summary object

**Test non-existent student:**
```bash
curl http://localhost:3000/api/students/999
```

Expected: Status 404 with error message

---

### **Test 2.4: GET /api/stats**

```bash
curl http://localhost:3000/api/stats
```

**Expected results:**
- ✅ Status 200
- ✅ Returns total_students (number)
- ✅ Returns active_now (number)
- ✅ Returns timestamp (ISO string)

---

### **Test 2.5: POST /api/progress**

**Test with existing student:**
```bash
curl -X POST http://localhost:3000/api/progress \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "event_type": "step_checked",
    "level": 2,
    "data": {"step": 1}
  }'
```

**Expected results:**
- ✅ Status 200
- ✅ Returns `{ "success": true, "student_id": 1, "message": "Progress saved" }`
- ✅ Event saved in database

**Test with new student:**
```bash
curl -X POST http://localhost:3000/api/progress \
  -H "Content-Type: application/json" \
  -d '{
    "student_name": "New Student",
    "class_code": "RBLX2025",
    "event_type": "session_start",
    "level": 1
  }'
```

**Expected results:**
- ✅ Status 200
- ✅ New student created
- ✅ Returns new student_id

**Test validation:**
```bash
curl -X POST http://localhost:3000/api/progress \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: Status 400 with error message

---

### **Test 2.6: CORS**

Open browser console and run:
```javascript
fetch('http://localhost:3000/api/students')
  .then(r => r.json())
  .then(console.log);
```

**Expected results:**
- ✅ No CORS error
- ✅ Data returned

---

## Phase 3: Tutorial Testing

### **Test 3.1: Page Load**

Open `versions/v9_game_style.html` in browser.

**Expected results:**
- ✅ Page loads without errors
- ✅ All images display
- ✅ CSS styles applied
- ✅ Orange header gradient shows
- ✅ Login modal appears

---

### **Test 3.2: Student Login**

1. Enter name: "Test Student"
2. Enter class code: "RBLX2025"
3. Click "Start Tutorial"

**Expected results:**
- ✅ Modal closes
- ✅ Tutorial content shows
- ✅ `studentSession` saved in localStorage
- ✅ Session start event sent to API
- ✅ No console errors

**Verify in browser console:**
```javascript
JSON.parse(localStorage.getItem('studentSession'))
```

Should show student data.

---

### **Test 3.3: Step Checkboxes**

1. Check step 1 in Level 1
2. Open browser console

**Expected results:**
- ✅ Checkbox checked
- ✅ Step item background turns green
- ✅ Console shows: `✅ Tracked: step_checked - Level 1`
- ✅ Event saved to database

**Verify:**
```bash
curl http://localhost:3000/api/students
```

Should show steps_completed incremented.

---

### **Test 3.4: Quiz System**

1. Complete all 4 steps in Level 1
2. Answer quiz question
3. Click "Submit Answer"

**Test correct answer:**
- ✅ Green success message
- ✅ "Unlock Next Level" button appears
- ✅ XP increases by 100
- ✅ Rank updates if needed
- ✅ Event tracked

**Test wrong answer:**
- ✅ Red error message
- ✅ Try again prompt
- ✅ No XP gained
- ✅ Level not unlocked

---

### **Test 3.5: Level Unlocking**

1. Answer quiz correctly
2. Click "Unlock Next Level"

**Expected results:**
- ✅ Next level card expands
- ✅ Previous level collapses
- ✅ Level unlock event tracked
- ✅ Progress bar updates

---

### **Test 3.6: Image Zoom**

1. Click on any image

**Expected results:**
- ✅ Modal overlay appears
- ✅ Image shown full size
- ✅ Click outside to close
- ✅ ESC key closes modal

---

### **Test 3.7: Offline Support**

1. **Stop backend server**
2. Complete some steps
3. Check browser console

**Expected results:**
- ✅ Console shows: `❌ Failed to track progress`
- ✅ Events queued in `offlineQueue`
- ✅ Events saved to `progressBackup`

4. **Restart backend server**
5. Wait 30 seconds

**Expected results:**
- ✅ Console shows: `🔄 Retrying offline events...`
- ✅ Events synced successfully
- ✅ Queue cleared

---

## Phase 4: Admin Dashboard Testing

### **Test 4.1: Dashboard Load**

Open `admin/index.html` in browser.

**Expected results:**
- ✅ Page loads without errors
- ✅ Header shows with orange gradient
- ✅ Statistics cards load
- ✅ Student table loads
- ✅ All students displayed

---

### **Test 4.2: Statistics Cards**

**Check values:**
- ✅ Total Students matches database
- ✅ Active Now shows correct count
- ✅ Avg Progress calculated correctly

---

### **Test 4.3: Search Function**

1. Type student name in search box

**Expected results:**
- ✅ Table filters in real-time
- ✅ Shows only matching students
- ✅ Case-insensitive search

---

### **Test 4.4: Class Filter**

1. Select class from dropdown

**Expected results:**
- ✅ Shows only students in that class
- ✅ "All Classes" shows all students

---

### **Test 4.5: Progress Filter**

1. Select progress range

**Expected results:**
- ✅ Shows only students in that range
- ✅ Correct filtering (0-20%, 20-50%, etc.)

---

### **Test 4.6: Refresh Button**

1. Click "🔄 Refresh"

**Expected results:**
- ✅ Reloads student data
- ✅ Updates statistics
- ✅ Table refreshes

---

### **Test 4.7: Student Detail View**

1. Click "View Details" for a student

**Expected results:**
- ✅ Navigates to student-detail.html?id=X
- ✅ Student name shown in header
- ✅ Summary cards populated
- ✅ Progress by level displayed
- ✅ Activity chart rendered
- ✅ Event history shown

---

### **Test 4.8: Activity Chart**

**Expected results:**
- ✅ Chart displays
- ✅ X-axis shows dates
- ✅ Y-axis shows activity counts
- ✅ Line connects points
- ✅ Tooltips work on hover

---

### **Test 4.9: Level Progress Display**

**Check each level shows:**
- ✅ Level number and title
- ✅ Status badge (Not Started / In Progress / Completed)
- ✅ Steps completed count
- ✅ Quiz attempts count
- ✅ Correct color coding

---

### **Test 4.10: Back Button**

1. Click "← Back"

**Expected results:**
- ✅ Returns to main dashboard
- ✅ Student list reloads

---

## Phase 5: Cross-Browser Testing

Test on multiple browsers:

### **Chrome/Edge (Chromium)**
- [ ] Tutorial works
- [ ] Admin dashboard works
- [ ] All features functional

### **Firefox**
- [ ] Tutorial works
- [ ] Admin dashboard works
- [ ] All features functional

### **Safari (Mac)**
- [ ] Tutorial works
- [ ] Admin dashboard works
- [ ] All features functional

### **Mobile Safari (iOS)**
- [ ] Tutorial loads
- [ ] Responsive layout
- [ ] Touch interactions work

### **Mobile Chrome (Android)**
- [ ] Tutorial loads
- [ ] Responsive layout
- [ ] Touch interactions work

---

## Phase 6: Responsive Design Testing

### **Desktop (1920x1080)**
- [ ] Layout looks good
- [ ] Images properly sized
- [ ] No horizontal scroll

### **Laptop (1366x768)**
- [ ] Layout adjusts
- [ ] All elements visible
- [ ] Font sizes readable

### **Tablet (768x1024)**
- [ ] Mobile layout triggered
- [ ] Cards stack vertically
- [ ] Navigation works
- [ ] Tables scroll horizontally

### **Mobile (375x667)**
- [ ] Content readable
- [ ] Buttons tappable (min 44px)
- [ ] Forms usable
- [ ] Images scale correctly

**Use browser DevTools:**
```
F12 → Toggle Device Toolbar → Test different sizes
```

---

## Phase 7: Performance Testing

### **Test 7.1: Load Time**

Use browser DevTools Network tab:

**Tutorial page:**
- [ ] Load time < 3 seconds
- [ ] Images load progressively
- [ ] No blocking resources

**Admin dashboard:**
- [ ] Load time < 2 seconds
- [ ] API calls < 500ms
- [ ] Charts render quickly

---

### **Test 7.2: Database Performance**

**Test with 100 students:**
```javascript
// Create test script
for (let i = 0; i < 100; i++) {
  await db.addStudent(`Student ${i}`, `student${i}@test.com`, 'TEST');
}
```

**Expected results:**
- ✅ GET /api/students returns in < 1 second
- ✅ Dashboard loads without lag
- ✅ Search/filter remains fast

---

### **Test 7.3: Concurrent Users**

**Simulate 10 concurrent students:**

Create file: `backend/load-test.js`

```javascript
async function simulateStudent(id) {
  for (let i = 0; i < 10; i++) {
    await fetch('http://localhost:3000/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: id,
        event_type: 'step_checked',
        level: 1,
        data: { step: i }
      })
    });

    await new Promise(r => setTimeout(r, 500));
  }
}

// Run 10 students in parallel
Promise.all([
  simulateStudent(1),
  simulateStudent(2),
  simulateStudent(3),
  simulateStudent(4),
  simulateStudent(5),
  simulateStudent(6),
  simulateStudent(7),
  simulateStudent(8),
  simulateStudent(9),
  simulateStudent(10)
]).then(() => console.log('✅ Load test complete'));
```

**Expected results:**
- ✅ Server handles all requests
- ✅ No errors
- ✅ Response times reasonable

---

## Phase 8: Security Testing

### **Test 8.1: SQL Injection**

Try malicious inputs:
```bash
curl -X POST http://localhost:3000/api/progress \
  -H "Content-Type: application/json" \
  -d '{
    "student_name": "Robert\"); DROP TABLE students;--",
    "event_type": "session_start"
  }'
```

**Expected results:**
- ✅ No database error
- ✅ Input sanitized/escaped
- ✅ Tables still exist

---

### **Test 8.2: XSS (Cross-Site Scripting)**

1. Enter name: `<script>alert('XSS')</script>`
2. Submit

**Expected results:**
- ✅ Script not executed
- ✅ Name displayed as plain text
- ✅ HTML encoded

---

### **Test 8.3: CSRF Protection**

If using authentication, test CSRF tokens.

---

### **Test 8.4: Rate Limiting**

Send 100 requests rapidly:
```bash
for i in {1..100}; do
  curl http://localhost:3000/api/students &
done
```

**Expected results:**
- ✅ Server responds (or rate limits)
- ✅ No crash
- ✅ Memory doesn't spike

---

## Phase 9: User Acceptance Testing

### **Test with real students:**

**Provide test scenario:**
```
1. Open the tutorial
2. Enter your name and class code
3. Complete Level 1
4. Answer the quiz
5. Unlock Level 2
6. Complete at least 2 steps in Level 2
```

**Observe:**
- [ ] Students understand instructions
- [ ] UI is intuitive
- [ ] No confusion points
- [ ] They complete tasks successfully

**Collect feedback:**
- What was confusing?
- What did you like?
- Any bugs or issues?
- Suggestions for improvement?

---

### **Test with teachers:**

**Provide test scenario:**
```
1. Open the admin dashboard
2. Find a specific student
3. View their progress detail
4. Identify students who need help
5. Check overall class progress
```

**Observe:**
- [ ] Teachers find data useful
- [ ] Dashboard is clear
- [ ] Metrics are meaningful
- [ ] No missing information

**Collect feedback:**
- Is the data you need available?
- What other metrics would help?
- Is anything confusing?
- Feature requests?

---

## Phase 10: Final Pre-Launch Checklist

### **Functionality:**
- [ ] All tutorial features work
- [ ] All admin features work
- [ ] All API endpoints work
- [ ] Database queries work
- [ ] No console errors
- [ ] No broken links
- [ ] No 404 errors

### **Content:**
- [ ] All text proofread
- [ ] All images display
- [ ] Instructions clear
- [ ] No typos
- [ ] Links work

### **Data:**
- [ ] Sample data removed (or kept intentionally)
- [ ] Database backup created
- [ ] Test accounts removed

### **Security:**
- [ ] HTTPS enabled (production)
- [ ] Default passwords changed
- [ ] API keys secured
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Input validation works

### **Performance:**
- [ ] Pages load quickly
- [ ] Images optimized
- [ ] Database queries fast
- [ ] No memory leaks

### **Deployment:**
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Database migrated
- [ ] Environment variables set
- [ ] Monitoring set up
- [ ] Backups configured

### **Documentation:**
- [ ] README updated
- [ ] API documented
- [ ] User guide written (optional)
- [ ] Teacher guide written (optional)

---

## Bug Tracking Template

When you find bugs, document them:

```markdown
## Bug #1: Student login fails on Safari

**Priority:** High
**Browser:** Safari 16.0
**Steps to reproduce:**
1. Open tutorial
2. Enter name and click Start
3. Nothing happens

**Expected:** Modal closes, tutorial loads
**Actual:** Modal stays open

**Console errors:**
```
TypeError: Cannot read property 'id' of null
```

**Fix:** Add null check before accessing studentSession.id

**Status:** Fixed
```

---

## Common Issues & Solutions

### **Issue 1: localStorage not persisting**

**Cause:** Browser privacy settings
**Solution:** Check browser allows localStorage, or use cookies

---

### **Issue 2: CORS errors in production**

**Cause:** Backend CORS not configured for frontend domain
**Solution:** Update CORS whitelist with production URLs

---

### **Issue 3: Images not loading**

**Cause:** Incorrect relative paths
**Solution:** Check image paths, use absolute URLs

---

### **Issue 4: Database connection fails**

**Cause:** Connection string incorrect
**Solution:** Verify DATABASE_URL environment variable

---

### **Issue 5: Charts not rendering**

**Cause:** Chart.js not loaded
**Solution:** Check CDN link, verify library loaded before use

---

## Automated Testing (Optional)

### **Install testing frameworks:**

```bash
npm install --save-dev jest supertest
```

### **Create API test:**

```javascript
// backend/server.test.js
const request = require('supertest');
const app = require('./server');

describe('API Tests', () => {
  test('GET /api/students returns students', async () => {
    const response = await request(app).get('/api/students');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('students');
    expect(Array.isArray(response.body.students)).toBe(true);
  });

  test('POST /api/progress saves event', async () => {
    const response = await request(app)
      .post('/api/progress')
      .send({
        student_id: 1,
        event_type: 'step_checked',
        level: 1,
        data: { step: 1 }
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

**Run tests:**
```bash
npm test
```

---

## Testing Schedule

### **During Development:**
- Test each feature as you build it
- Fix bugs immediately

### **Week 2, End of Day:**
- Run Phase 1-4 tests
- Fix any issues

### **Week 3, Day 1:**
- Full testing pass (Phase 1-7)
- Cross-browser testing
- Performance testing

### **Week 3, Day 2:**
- User acceptance testing
- Bug fixes

### **Week 3, Day 3:**
- Final QA checklist
- Deploy to staging
- Test on staging

### **Week 3, Day 4:**
- Deploy to production
- Smoke test production
- Monitor for issues

### **Week 3, Day 5:**
- Final verification
- Soft launch to small group
- Monitor closely

---

## Post-Launch Monitoring

### **First 24 hours:**
- [ ] Check logs every 2 hours
- [ ] Monitor error rates
- [ ] Watch user activity
- [ ] Test major features still work

### **First week:**
- [ ] Daily log review
- [ ] Check database size
- [ ] Monitor performance
- [ ] Collect user feedback

### **First month:**
- [ ] Weekly performance review
- [ ] Analyze usage patterns
- [ ] Identify improvement areas
- [ ] Plan updates

---

## Success Metrics

Track these metrics to measure success:

**Student engagement:**
- Number of students registered
- Average levels completed
- Average session duration
- Completion rate

**System performance:**
- Average page load time
- API response time
- Error rate
- Uptime percentage

**Teacher usage:**
- Dashboard login frequency
- Most viewed reports
- Feature usage

---

## Next Steps

**✅ Testing complete!**

**🎉 Ready to launch!**

**After launch:**
- Monitor closely
- Collect feedback
- Plan improvements
- Iterate and improve

---

## Testing Tools Reference

**Browser DevTools:**
- Chrome DevTools (F12)
- Firefox Developer Tools (F12)
- Safari Web Inspector (Cmd+Opt+I)

**Network Testing:**
- Postman - API testing
- curl - Command line API testing
- Insomnia - API client

**Performance:**
- Google Lighthouse
- WebPageTest
- GTmetrix

**Cross-browser:**
- BrowserStack (paid)
- LambdaTest (free tier)
- Manual testing on real devices

**Monitoring:**
- UptimeRobot - Uptime monitoring
- Google Analytics - Usage analytics
- Sentry - Error tracking (free tier)

---

**Document Status:** ✅ Complete
**Last Updated:** October 18, 2025
**Version:** 1.0
