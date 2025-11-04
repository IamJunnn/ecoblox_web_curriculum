# Debug Admin Login Issue

## Step 1: Check Current Cookies

Open browser console and paste this:

```javascript
// Check all cookies
console.log('=== ALL COOKIES ===');
document.cookie.split(';').forEach(c => console.log(c.trim()));

// Parse cookies
const cookies = {};
document.cookie.split(';').forEach(c => {
  const [key, value] = c.trim().split('=');
  cookies[key] = value;
});

console.log('\n=== PARSED COOKIES ===');
console.log('access_token:', cookies.access_token ? 'EXISTS' : 'MISSING');
console.log('user_role:', cookies.user_role);

// Check localStorage
console.log('\n=== LOCAL STORAGE ===');
console.log('access_token:', localStorage.getItem('access_token') ? 'EXISTS' : 'MISSING');
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('user role:', user.role);
```

## Step 2: Clear Everything and Try Again

```javascript
// Clear everything
localStorage.clear();
document.cookie.split(';').forEach(c => {
  const name = c.trim().split('=')[0];
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
});
console.log('✅ Cleared all cookies and localStorage');
console.log('Now refresh the page and try logging in as admin');
```

## Step 3: Monitor Login Process

Before clicking login, paste this:

```javascript
// Override console.log temporarily to capture all logs
const originalLog = console.log;
const logs = [];
console.log = (...args) => {
  logs.push(args);
  originalLog(...args);
};

// After login, check logs
setTimeout(() => {
  console.log = originalLog;
  console.log('\n=== CAPTURED LOGS ===');
  logs.forEach(log => console.log(...log));
}, 5000);
```

Then try logging in and wait 5 seconds.

## What to Look For

### If admin login works but redirects back:
- Check if `user_role` cookie is set to `admin`
- If it says something else, that's the problem

### If cookies are missing:
- The 300ms delay might not be enough
- Browser might be blocking cookies

### If user_role is undefined or null:
- Backend might not be returning the role correctly
