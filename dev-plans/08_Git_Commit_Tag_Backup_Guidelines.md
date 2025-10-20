# Git Commit, Tag & Database Backup Guidelines

**Date**: October 20, 2025
**Project**: Roblox Studio Academy - Student Progress Monitoring System
**Purpose**: Standard procedures for version control and data backup

---

## Overview

This guide provides step-by-step procedures for:
1. Creating meaningful git commits
2. Tagging versions properly
3. Backing up the SQLite database
4. Restoring from backups

---

## Part 1: Git Commit Process

### When to Commit

Commit when you have completed:
- ✅ A feature or bug fix
- ✅ A logical unit of work
- ✅ Changes that have been tested
- ✅ Multiple related file changes

**Don't commit**:
- ❌ Broken or untested code
- ❌ Database files (database.db)
- ❌ Node modules
- ❌ Temporary files

### Step 1: Check Current Status

```bash
cd /Users/chrislee/Project/Web_Service
git status
```

**What to look for**:
- Modified files (red = unstaged, green = staged)
- Untracked files (new files not in git)
- Files to be committed

### Step 2: Stage Files

**Stage all changes**:
```bash
git add .
```

**Stage specific files**:
```bash
git add backend/routes.js index.html assets/js/auth.js
```

**Stage by pattern**:
```bash
git add "admin/*.html"
git add "backend/*.js"
```

### Step 3: Review Staged Changes

```bash
git status
git diff --staged
```

**Check for**:
- Accidentally staged files (.db, node_modules, etc.)
- Missing files that should be included

### Step 4: Write Commit Message

**Format Template**:
```
Title (50 chars max): Brief summary of changes

Detailed description (wrap at 72 chars):
- What was changed
- Why it was changed
- How it was tested

Components affected:
- Backend: list of changes
- Frontend: list of changes
- Database: migrations run

Features added:
- Feature 1 description
- Feature 2 description

Bug fixes:
- Bug 1 fix
- Bug 2 fix

Test results:
- Test 1: ✅ Passed
- Test 2: ✅ Passed

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Good commit message example**:
```bash
git commit -m "$(cat <<'EOF'
Implement PIN Code Authentication System

Added secure PIN-based login for students to prevent account
impersonation and ensure accurate progress tracking.

Backend Changes:
- Created migrate-pin-system.js for database migration
- Added PIN generation functions to routes.js
- Created POST /api/auth/student-login endpoint
- Auto-generate PINs when creating students

Frontend Changes:
- Updated index.html with PIN input field
- Rewrote handleStudentLogin() in auth.js
- Added PIN validation (4 digits, numeric only)

Features:
- ✅ Unique 4-digit PIN per student
- ✅ Teacher-controlled PIN reset
- ✅ Auto-generation on account creation

Test Results:
- Login with correct PIN: ✅
- Login with wrong PIN: ✅ (proper error)
- Create student: ✅ (PIN auto-generated)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Bad commit message examples**:
```bash
# Too vague
git commit -m "fixed stuff"

# No context
git commit -m "update routes.js"

# Too technical, no why
git commit -m "added line 45 to routes.js"
```

### Step 5: Verify Commit

```bash
# View last commit
git log -1

# View last commit with changes
git log -1 --stat

# View commit details
git show HEAD
```

---

## Part 2: Git Tag Process

### When to Create Tags

Create tags for:
- ✅ Major version releases (v1.0, v2.0)
- ✅ Minor version releases (v1.1, v1.2)
- ✅ Milestone completions
- ✅ Production deployments

**Tag naming convention**:
- `vX.Y-description` - Version tags (v1.0-mvp, v2.0-pin-auth)
- `YYYY-MM-DD-description` - Date-based tags (2025-10-20-feature-name)

### Step 1: Decide Tag Name and Type

**Version tags** (for releases):
```
v1.0-mvp-complete
v2.0-pin-authentication
v2.1-google-sso
```

**Date tags** (for features):
```
2025-10-20-pin-authentication
2025-10-21-email-notifications
```

### Step 2: Create Annotated Tag

**Full tag with message**:
```bash
git tag -a "v2.0-pin-authentication" -m "Version 2.0 - PIN Authentication System

Complete implementation of secure student authentication:

Key Features:
- PIN-based student authentication (4-digit codes)
- Complete admin management UI
- Teacher/Admin password authentication
- Role-based access control
- 9 new admin API endpoints

Components:
- Backend: Express.js API with SQLite
- Frontend: Bootstrap 5 responsive UI
- Authentication: PIN + SHA256 passwords

Database Migrations:
- migrate-database.js (courses table)
- migrate-roles.js (role system)
- migrate-pin-system.js (PIN authentication)

Security Enhancements:
- Prevents student impersonation
- Unique PIN per student
- Teacher-controlled PIN management
- Role-based endpoint protection

Files Changed: 16 files, 4881 insertions
Test Status: All tests passed (14/14)
Production Status: ✅ READY

Default Accounts:
- Teacher: teacher@robloxacademy.com / teacher123
- Admin: admin@robloxacademy.com / admin123"
```

**Lightweight tag** (not recommended):
```bash
# Creates tag without message (not recommended)
git tag "v2.0-pin-authentication"
```

### Step 3: Verify Tag

```bash
# List all tags
git tag --list

# Show tag details
git show v2.0-pin-authentication

# Show tag without commit details
git show v2.0-pin-authentication --quiet
```

### Step 4: View Tag History

```bash
# List tags with dates
git tag -n

# List tags with creation info
git for-each-ref refs/tags --format='%(refname:short) %(creatordate:short) %(subject)'

# Show all tags sorted by version
git tag --sort=v:refname
```

---

## Part 3: Database Backup Process

### Why Backup the Database?

**Backup before**:
- Running database migrations
- Testing new features
- Making bulk data changes
- Deploying to production
- Major version updates

**Backup frequency**:
- **Development**: Before each migration
- **Testing**: Daily
- **Production**: Hourly (automated)

### Step 1: Manual Database Backup

**Create timestamped backup**:
```bash
# Navigate to backend directory
cd /Users/chrislee/Project/Web_Service/backend

# Create backup with timestamp
cp database.db "backups/database-$(date +%Y%m%d-%H%M%S).db"

# Example output: database-20251020-165200.db
```

**Create named backup**:
```bash
# Before migration
cp database.db backups/database-before-pin-migration.db

# Before major change
cp database.db backups/database-before-v2-upgrade.db

# Before testing
cp database.db backups/database-stable.db
```

### Step 2: Verify Backup

```bash
# Check backup file exists
ls -lh backups/database-*.db

# Check file size (should match original)
du -h database.db
du -h backups/database-20251020-165200.db

# Verify backup integrity
sqlite3 backups/database-20251020-165200.db "PRAGMA integrity_check;"
# Should output: ok
```

### Step 3: Test Backup (Optional)

```bash
# Create test directory
mkdir -p test-restore

# Copy backup to test location
cp backups/database-20251020-165200.db test-restore/database.db

# Test database queries
sqlite3 test-restore/database.db "SELECT COUNT(*) FROM students;"
sqlite3 test-restore/database.db "SELECT * FROM students LIMIT 5;"

# Clean up test
rm -rf test-restore
```

### Step 4: Automated Backup Script

Create `backend/backup-database.sh`:
```bash
#!/bin/bash

# Configuration
DB_PATH="/Users/chrislee/Project/Web_Service/backend/database.db"
BACKUP_DIR="/Users/chrislee/Project/Web_Service/backend/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/database-$TIMESTAMP.db"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Creating database backup..."
cp "$DB_PATH" "$BACKUP_FILE"

# Verify backup
if [ -f "$BACKUP_FILE" ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ Backup created: $BACKUP_FILE ($SIZE)"

  # Run integrity check
  sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check;" > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✅ Integrity check passed"
  else
    echo "❌ Integrity check failed!"
    exit 1
  fi
else
  echo "❌ Backup failed!"
  exit 1
fi

# Keep only last 10 backups
echo "Cleaning old backups (keeping last 10)..."
ls -t "$BACKUP_DIR"/database-*.db | tail -n +11 | xargs rm -f

echo "✅ Backup complete!"
```

**Make script executable**:
```bash
chmod +x backend/backup-database.sh
```

**Run backup script**:
```bash
./backend/backup-database.sh
```

---

## Part 4: Database Restore Process

### When to Restore

Restore database when:
- Migration fails
- Data corruption occurs
- Testing went wrong
- Need to rollback changes

### Step 1: Choose Backup to Restore

```bash
# List available backups
ls -lht backups/database-*.db

# Example output:
# -rw-r--r--  1 user  staff   245K Oct 20 16:52 database-20251020-165200.db
# -rw-r--r--  1 user  staff   240K Oct 20 15:30 database-20251020-153000.db
# -rw-r--r--  1 user  staff   235K Oct 20 14:00 database-before-pin-migration.db
```

### Step 2: Stop Backend Server

**Find and kill node processes**:
```bash
# List all node processes
ps aux | grep "node server.js"

# Kill all node server processes
ps aux | grep "node server.js" | grep -v grep | awk '{print $2}' | xargs kill -9

echo "All node processes killed"
```

### Step 3: Backup Current Database (Safety)

```bash
# Always backup current state before restoring
cp database.db "backups/database-before-restore-$(date +%Y%m%d-%H%M%S).db"
```

### Step 4: Restore Backup

```bash
# Option 1: Replace current database
cp backups/database-20251020-165200.db database.db

# Option 2: Restore with confirmation
read -p "Restore from database-20251020-165200.db? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  cp backups/database-20251020-165200.db database.db
  echo "✅ Database restored"
else
  echo "❌ Restore cancelled"
fi
```

### Step 5: Verify Restored Database

```bash
# Check database integrity
sqlite3 database.db "PRAGMA integrity_check;"

# Check table counts
sqlite3 database.db "SELECT
  (SELECT COUNT(*) FROM students) as students,
  (SELECT COUNT(*) FROM progress_events) as events,
  (SELECT COUNT(*) FROM courses) as courses;"

# Check specific data
sqlite3 database.db "SELECT id, name, email FROM students LIMIT 5;"
```

### Step 6: Restart Server

```bash
# Navigate to backend
cd backend

# Start server
node server.js
```

### Step 7: Test Application

```bash
# Test API endpoints
curl http://localhost:3300/api/students

# Test student count
curl http://localhost:3300/api/stats

# Login to admin panel and verify data
open http://localhost:8080/admin/manage-students.html
```

---

## Part 5: Pre-Migration Checklist

Before running any database migration:

```bash
# 1. Create backup
./backend/backup-database.sh

# 2. Record current state
sqlite3 backend/database.db "SELECT COUNT(*) FROM students;" > pre-migration-state.txt
sqlite3 backend/database.db "PRAGMA table_info(students);" >> pre-migration-state.txt

# 3. Stop server
ps aux | grep "node server.js" | grep -v grep | awk '{print $2}' | xargs kill -9

# 4. Run migration
node backend/migrate-pin-system.js

# 5. Verify migration
sqlite3 backend/database.db "PRAGMA table_info(students);"

# 6. Record post-migration state
sqlite3 backend/database.db "SELECT COUNT(*) FROM students;" > post-migration-state.txt

# 7. Compare states
diff pre-migration-state.txt post-migration-state.txt

# 8. Restart server
cd backend && node server.js
```

---

## Part 6: Commit & Tag Workflow Example

**Complete workflow for new feature**:

```bash
# 1. Make changes
# ... edit files ...

# 2. Test changes
npm test  # or manual testing

# 3. Create database backup
./backend/backup-database.sh

# 4. Check git status
git status

# 5. Stage changes
git add .

# 6. Create commit
git commit -m "$(cat <<'EOF'
Add email notification system

Implemented email notifications for PIN resets and welcome messages.

Backend Changes:
- Added nodemailer dependency
- Created email service module
- Added email templates
- Updated PIN reset to send email

Frontend Changes:
- Added email settings page
- Email notification preferences

Features:
- ✅ Welcome email on account creation
- ✅ PIN reset notification
- ✅ Progress milestone emails

Test Results:
- Email sending: ✅
- Template rendering: ✅
- SMTP connection: ✅

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# 7. Verify commit
git log -1 --stat

# 8. Create tag
git tag -a "v2.1-email-notifications" -m "Version 2.1 - Email Notifications

Added email notification system for student account management.

New Features:
- Welcome emails on registration
- PIN reset notifications
- Progress milestone emails
- Email preference settings

Dependencies Added:
- nodemailer v6.9.0

Files Changed: 8 files, 450 insertions
Test Status: All tests passed (17/17)"

# 9. Verify tag
git show v2.1-email-notifications --quiet

# 10. List all tags
git tag --list

# Done!
```

---

## Part 7: Backup Retention Policy

### Backup Types

**Development backups**:
- Keep: Last 10 manual backups
- Location: `backend/backups/`
- Retention: 1 week

**Migration backups**:
- Keep: All (named backups)
- Location: `backend/backups/`
- Format: `database-before-[migration-name].db`
- Retention: Forever (or until confirmed stable)

**Production backups** (future):
- Keep:
  - Last 7 days (daily)
  - Last 4 weeks (weekly)
  - Last 12 months (monthly)
- Location: Cloud storage (S3, Google Cloud)
- Automated: Cron job

### Cleanup Old Backups

```bash
# List backups older than 7 days
find backend/backups/ -name "database-*.db" -mtime +7

# Delete backups older than 7 days (be careful!)
find backend/backups/ -name "database-*.db" -mtime +7 -delete

# Keep only last 10 backups
cd backend/backups
ls -t database-*.db | tail -n +11 | xargs rm -f
```

---

## Part 8: Emergency Recovery

### Scenario 1: Accidentally Deleted Database

```bash
# 1. Don't panic!
# 2. Stop the server immediately
ps aux | grep "node server.js" | awk '{print $2}' | xargs kill -9

# 3. Find most recent backup
ls -lht backend/backups/database-*.db | head -1

# 4. Restore
cp backend/backups/database-20251020-165200.db backend/database.db

# 5. Verify
sqlite3 backend/database.db "PRAGMA integrity_check;"

# 6. Restart server
cd backend && node server.js
```

### Scenario 2: Corrupted Database

```bash
# 1. Stop server
ps aux | grep "node server.js" | awk '{print $2}' | xargs kill -9

# 2. Backup corrupted database (for analysis)
cp backend/database.db backend/backups/database-corrupted-$(date +%Y%m%d-%H%M%S).db

# 3. Try repair
sqlite3 backend/database.db "PRAGMA integrity_check;"
# If shows errors, restore from backup

# 4. Restore from backup
cp backend/backups/database-20251020-165200.db backend/database.db

# 5. Verify restored database
sqlite3 backend/database.db "SELECT COUNT(*) FROM students;"
```

### Scenario 3: Migration Failed

```bash
# 1. Stop server
ps aux | grep "node server.js" | awk '{print $2}' | xargs kill -9

# 2. Find pre-migration backup
ls -lht backend/backups/database-before-*.db

# 3. Restore
cp backend/backups/database-before-pin-migration.db backend/database.db

# 4. Verify
sqlite3 backend/database.db "PRAGMA integrity_check;"
sqlite3 backend/database.db "SELECT COUNT(*) FROM students;"

# 5. Fix migration script
# ... edit migration file ...

# 6. Create new backup
cp backend/database.db backend/backups/database-stable.db

# 7. Re-run migration
node backend/migrate-pin-system.js

# 8. Restart server
cd backend && node server.js
```

---

## Part 9: Best Practices

### Git Commits
✅ **DO**:
- Commit tested, working code
- Write descriptive commit messages
- Commit related changes together
- Reference issue numbers if applicable
- Use present tense ("Add feature" not "Added feature")

❌ **DON'T**:
- Commit broken code
- Use vague messages like "fix stuff"
- Commit database files
- Commit node_modules
- Make giant commits with unrelated changes

### Git Tags
✅ **DO**:
- Tag all releases
- Use semantic versioning
- Write detailed tag messages
- Tag after testing is complete

❌ **DON'T**:
- Tag untested code
- Use lightweight tags for releases
- Reuse tag names
- Tag without commit messages

### Database Backups
✅ **DO**:
- Backup before migrations
- Verify backup integrity
- Keep multiple backup copies
- Name backups descriptively
- Test restore process regularly

❌ **DON'T**:
- Skip backups before migrations
- Delete all backups at once
- Commit database files to git
- Restore without backing up current state

---

## Part 10: Quick Reference Commands

### Git Commands
```bash
# Status and info
git status
git log -1
git show HEAD
git tag --list

# Staging and committing
git add .
git commit -m "message"
git tag -a "tag-name" -m "tag message"

# Viewing changes
git diff
git diff --staged
git log --oneline -10
```

### Database Commands
```bash
# Backup
cp database.db backups/database-$(date +%Y%m%d-%H%M%S).db

# Restore
cp backups/database-20251020-165200.db database.db

# Verify
sqlite3 database.db "PRAGMA integrity_check;"

# Query
sqlite3 database.db "SELECT COUNT(*) FROM students;"
```

### Server Commands
```bash
# Start
node server.js

# Stop
ps aux | grep "node server.js" | awk '{print $2}' | xargs kill -9

# Start in background
node server.js &

# Check if running
ps aux | grep "node server.js"
```

---

## Summary Checklist

**Before Making Changes**:
- [ ] Database backed up
- [ ] Server stopped (if needed)
- [ ] Current state documented

**After Making Changes**:
- [ ] Code tested thoroughly
- [ ] Files staged with `git add`
- [ ] Descriptive commit message written
- [ ] Commit verified with `git log -1`
- [ ] Tag created (if milestone)
- [ ] Tag verified with `git show`
- [ ] Server restarted
- [ ] Application tested

**Regular Maintenance**:
- [ ] Clean old backups weekly
- [ ] Review commit history monthly
- [ ] Test backup restore quarterly
- [ ] Update documentation as needed

---

**Document Version**: 1.0
**Last Updated**: October 20, 2025
**Next Review**: November 20, 2025
