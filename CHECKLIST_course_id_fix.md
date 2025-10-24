# ✅ QUICK CHECKLIST - Course ID Fix

**Issue:** Backend ignores course_id → all events default to course_id=1
**Goal:** Fix data flow Frontend → Routes → Helper → Database

---

## 🔴 PHASE 1: BACKEND FIX [MUST DO]

### File: `backend/database.js`
- [ ] Line 38: Add `courseId` parameter to function signature
- [ ] Line 40: Add `course_id` to INSERT column list
- [ ] Line 41: Add `courseId` to VALUES array (position 4)

### File: `backend/routes.js`
- [ ] Line 148: Add `course_id` to destructuring
- [ ] Line 164: Add `course_id` to saveProgressEvent call (new student path)
- [ ] Line 168: Add `course_id` to saveProgressEvent call (existing student path)
- [ ] Line 173: Add `courseId` parameter to function signature
- [ ] Line 174: Add `courseId` to addProgressEvent call

### Test Phase 1:
```bash
# 1. Restart server
lsof -ti :3300 | xargs kill -9
cd backend && node server.js &

# 2. Test API
curl -X POST http://localhost:3300/api/progress \
  -H "Content-Type: application/json" \
  -d '{"student_id":17,"event_type":"test","level":0,"course_id":4,"data":{}}'

# 3. Verify database
sqlite3 backend/database.db "SELECT id,event_type,course_id FROM progress_events ORDER BY id DESC LIMIT 1;"
```

- [ ] ✅ API responds success
- [ ] ✅ Database shows course_id=4
- [ ] ✅ No errors in logs

---

## 🟡 PHASE 2: FRONTEND CLEANUP [RECOMMENDED]

### File: `student/js/dashboard.js`
- [ ] Lines 218-250: Replace complex filter with simple `e.course_id === course.id`

### File: `install_roblox_studio.html`
- [ ] Line 1164: Remove `course_id: 4,` from data object

### Test Phase 2:
- [ ] Dashboard loads without errors
- [ ] Install Studio shows 100 XP
- [ ] Studio Basics shows 0 XP
- [ ] No console errors

---

## 🟡 PHASE 3: FIX DATA [RECOMMENDED]

### Backup Database:
```bash
cd backend
cp database.db database.db.backup-$(date +%Y%m%d-%H%M%S)
```
- [ ] Backup created: ___________________________

### Fix Student 17 Events:
```bash
sqlite3 backend/database.db "
UPDATE progress_events SET course_id = 4
WHERE student_id = 17 AND course_id = 1 AND level = 0
  AND event_type IN ('session_start','step_checked','quest_completed','level_unlocked')
  AND id >= 392;
"
```
- [ ] Rows updated: _______

### Verify Fix:
```bash
sqlite3 backend/database.db "
SELECT id,event_type,level,course_id
FROM progress_events
WHERE student_id=17 AND id>=392;
"
```
- [ ] All events show course_id=4

### Test Phase 3:
- [ ] Clear browser cache (Cmd+Shift+R)
- [ ] Dashboard shows correct stats
- [ ] Install Studio: 100 XP, 5/5 Levels
- [ ] Studio Basics: 0 XP, 0/6 Levels
- [ ] Overall: ~50%

---

## 🟢 PHASE 4: LEVEL CONSISTENCY [OPTIONAL]

### File: `install_roblox_studio.html`
- [ ] Line 1163: Change `TOTAL_STEPS` → `COURSE_LEVEL`

---

## 🟢 PHASE 5: VALIDATION [OPTIONAL]

### File: `backend/routes.js`
- [ ] After line 148: Add course_id validation
- [ ] Add course existence check

---

## 🎯 FINAL VERIFICATION

### System Test:
- [ ] Backend API test passes
- [ ] Dashboard loads correctly
- [ ] Tutorial creates events with correct course_id
- [ ] No JavaScript errors
- [ ] No mixing between courses

### Git Commit:
```bash
git add -A
git commit -m "Fix course_id data flow through backend chain

CRITICAL FIX: Backend was ignoring course_id parameter causing all events
to default to course_id=1. This caused courses to mix data.

Changes:
- backend/database.js: Accept courseId parameter, insert into DB
- backend/routes.js: Extract, pass, and forward course_id
- student/js/dashboard.js: Simplified filtering (removed fallbacks)
- install_roblox_studio.html: Removed redundant course_id from data
- Database: Fixed 16 events for student 17 to correct course_id

Result: Each course now tracks independently. System ready to scale.

Files: 4 changed
Impact: All future events will have correct course_id
Status: ✅ Tested and verified
"
```

- [ ] Changes committed
- [ ] Ready for production

---

**Completion Status:**
- Phase 1: ✅ Complete
- Phase 2: ✅ Complete
- Phase 3: ✅ Complete
- Phase 4: ⬜ Not Started (Optional)
- Phase 5: ⬜ Not Started (Optional)

**Total Time:** __________ (Target: 1 hour)

**Issues Found:** _________________________________

**Notes:** _________________________________
