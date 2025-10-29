# Development Scripts Guide

## Quick Start

### Kill All Servers
**Double-click or run:**
```bash
kill-servers.bat
```
This will stop ALL development servers on ports 3000, 3300, and 3400.

**Always run this when:**
- You're done working
- Before starting fresh
- When you get port conflicts
- When things are acting weird

---

## Starting Servers

### Option 1: Express Backend (Recommended - Working & Stable)
```bash
start-express.bat
```
- Runs on: `http://localhost:3300`
- Status: ✅ Fully functional, database seeded
- Use this for frontend development

### Option 2: NestJS Backend (TypeScript errors, but works)
```bash
start-nestjs.bat
```
- Runs on: `http://localhost:3400`
- Status: ⚠️ Has TypeScript compilation warnings (non-blocking)
- Use for NestJS migration work

### Start Frontend
```bash
start-frontend.bat
```
- Runs on: `http://localhost:3000`
- Connects to backend at: `http://localhost:3300` (Express)

---

## Typical Workflow

### Daily Start:
1. Run `kill-servers.bat` (clean slate)
2. Run `start-express.bat` (backend)
3. Run `start-frontend.bat` (frontend)
4. Open browser: `http://localhost:3000`

### When Done:
1. Run `kill-servers.bat`
2. Close terminals

---

## Test Credentials

### Student Login:
- Email: `alice@school.com`
- PIN: `1234`

### Teacher Login:
- Email: `teacher@robloxacademy.com`
- Password: `password123`

### Admin Login:
- Email: `admin@robloxacademy.com`
- Password: `password123`

---

## Troubleshooting

### Port Already in Use Error?
**Solution:** Run `kill-servers.bat` first!

### Frontend can't connect to backend?
**Check:**
1. Is backend running? (You should see "Server running on..." message)
2. Is it on the right port? (Should be 3300 for Express)
3. Try refreshing browser
4. Check browser console for errors

### NestJS won't start on 3400?
**Solution:**
1. Run `kill-servers.bat`
2. Restart with `start-nestjs.bat`

---

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Next.js Frontend | 3000 | http://localhost:3000 |
| Express Backend | 3300 | http://localhost:3300 |
| NestJS Backend | 3400 | http://localhost:3400 |

---

## Manual Commands (if scripts don't work)

### Kill servers manually:
```bash
# Find processes
netstat -ano | findstr ":3000 :3300 :3400"

# Kill specific PID
taskkill /F /PID <PID_NUMBER>
```

### Start manually:
```bash
# Express
cd backend && node server.js

# NestJS
cd backend-nest && set PORT=3400 && npm run start:dev

# Frontend
cd frontend-next && npm run dev
```
