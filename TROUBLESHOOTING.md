# Troubleshooting "Failed to load teacher data"

## Problem
The admin portal shows "Failed to load teacher data" when clicking on "Manage Teachers".

## Root Cause Analysis

The backend is working correctly (verified via test scripts). The issue is on the frontend.

## Most Likely Causes

### 1. Authentication Token Missing or Invalid

**Check**: Open browser DevTools (F12) → Console tab → Look for errors
**Check**: Open browser DevTools (F12) → Network tab → Click "Manage Teachers" → Look for the `/admin/teachers` request

**Expected behavior:**
- Request should have `Authorization: Bearer <token>` header
- Response should be 200 OK with teacher data

**If you see 401 Unauthorized:**
- You need to log in to the admin portal first
- The token might have expired
- Try logging out and logging back in

### 2. CORS Issues

**Check**: Look in browser console for CORS errors

**Fix**: Ensure backend CORS is configured for `http://localhost:3000`
(Already configured in `backend/src/main.ts`)

### 3. API URL Mismatch

**Check**: Verify the frontend is calling the correct URL:
- Should be: `http://localhost:3400/admin/teachers`
- Auth should be: `http://localhost:3400/api/auth/login`

## How to Fix

### Step 1: Verify Both Servers are Running

```bash
# Check backend (port 3400)
netstat -ano | findstr :3400

# Check frontend (port 3000)
netstat -ano | findstr :3000
```

Both should show LISTENING

### Step 2: Test Backend Directly

```bash
cd backend
node test-teachers-direct.js
```

Should show SUCCESS with teacher data

### Step 3: Check Frontend Authentication

1. Open http://localhost:3000 in browser
2. Make sure you're logged in as admin
3. Open DevTools (F12) → Application tab → Local Storage
4. Check if `access_token` exists

**If no token exists:**
- You need to log in first
- Go to the home page and log in with admin credentials

### Step 4: Check Network Request

1. Open DevTools (F12) → Network tab
2. Clear the network log
3. Click "Manage Teachers" again
4. Look for the `/admin/teachers` request

**Check the request:**
- URL: Should be `http://localhost:3400/admin/teachers`
- Headers: Should include `Authorization: Bearer <token>`
- Status: Should be 200

**If status is 401:**
- Token is missing or invalid
- Log out and log back in

**If status is 404:**
- URL might be wrong
- Check if backend is running on port 3400

**If request doesn't appear:**
- Check browser console for JavaScript errors
- The API call might be failing before it even reaches the network

### Step 5: Clear Cache and Reload

1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard reload the page (Ctrl + Shift + R)
3. Try again

## Quick Fix

The most common issue is that **you need to log in to the admin portal first**.

1. Go to http://localhost:3000
2. Click "Admin" in the top right
3. Log in with:
   - Email: `admin@ecoblox.build`
   - Password: `admin123`
4. After successful login, try accessing "Manage Teachers" again

## If Issue Persists

Please check browser DevTools and report:
1. Any errors in the Console tab
2. The Network request details for `/admin/teachers`
3. Whether `access_token` exists in Local Storage
