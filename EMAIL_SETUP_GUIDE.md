# Student Email Setup Guide

## What Changed

I've added automatic email sending when students are created. Now when you create a student from the admin portal, they will automatically receive a welcome email with their login credentials.

## Changes Made

### 1. Updated `backend/src/admin/admin.service.ts`

The `createStudent` function now:
- **Auto-generates a 4-digit PIN** if one isn't provided
- **Sends a welcome email** to the student with their login credentials
- **Returns detailed response** including whether the email was sent successfully

### 2. Email Features

Students receive a beautiful HTML email containing:
- Welcome message
- Their email address
- Their 4-digit PIN code (large and easy to read)
- Direct link to login
- Step-by-step login instructions
- Information about what they can do in EcoBlox Academy

## How to Use

### Step 1: Restart the Backend Server

**IMPORTANT:** You need to restart the backend server for the changes to take effect.

```bash
# Stop the current backend server (press Ctrl+C in the terminal where it's running)

# Then start it again:
cd backend
npm run start:dev
```

### Step 2: Create a Student

1. Go to the Admin Portal: http://localhost:3000/admin
2. Click "Manage Students"
3. Click "Add Student"
4. Fill in:
   - Student Name
   - Student Email (they will receive the email here)
   - PIN Code (optional - will be auto-generated if left empty)
   - Optional: Parent Email, Teacher assignment
5. Click "Create Student"

### Step 3: Check Email Status

After creating a student, you'll see a message indicating whether the email was sent successfully.

## Email Configuration

Your email is already configured in `backend/.env`:

```
EMAIL_USER=lovejsson@gmail.com
EMAIL_PASS=mvkyeaiblsltqhgd  (Gmail App Password)
```

### How It Works

1. **If email credentials are configured** (they are): Emails will be sent via Gmail
2. **If there's an error**: The student is still created, but the email content will be logged to the backend console

### Testing Email Sending

You can test the email functionality:

```bash
cd backend
node test-student-email.js
```

This will:
1. Login as admin
2. Create a test student
3. Show whether the email was sent
4. Display the student's credentials

## Email Template

The email students receive includes:

```
Subject: Welcome to EcoBlox - Your Login Credentials

Content:
- Welcome message with student's name
- Login credentials (Email + PIN in large text)
- "Go to EcoBlox Academy" button
- Step-by-step login instructions
- List of features they can access
```

## What the Student Sees

When a student receives the email, they'll see:
- Their email address: `student@example.com`
- Their PIN code: `1234` (in large, bold text)
- A button to go directly to the login page
- Clear instructions on how to log in

## Troubleshooting

### Email Not Sending

If emails aren't being sent:

1. **Check backend logs** for error messages
2. **Verify Gmail credentials** in `backend/.env`
3. **Check Gmail security settings**:
   - Make sure "Less secure app access" is enabled OR
   - Use an App Password (already configured)

### Student Didn't Receive Email

1. **Check spam/junk folder**
2. **Verify the email address** is correct
3. **Check backend console** for email sending confirmation:
   - Look for: `✅ Welcome email sent to student: email@example.com`
   - Or: `❌ Failed to send welcome email to student`

### Dev Mode (No Email Credentials)

If email credentials aren't configured, the system will:
- Still create the student successfully
- Log the email content to the console instead of sending
- You can see the PIN and credentials in the backend logs

## Next Steps

After restarting the backend server:

1. Try creating a new student
2. Check if they receive the email
3. Have them test logging in with the credentials from the email

## Additional Notes

- Emails are sent asynchronously - student creation won't fail if email fails
- The frontend will show a success message with the student's PIN
- Teachers can always resend credentials manually if needed
- All email activity is logged to the backend console for debugging
