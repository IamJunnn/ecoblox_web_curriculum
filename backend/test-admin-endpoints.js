/**
 * Test script for Admin endpoints
 * Run this after starting the backend server with: npm run start:dev
 */

const BASE_URL = 'http://localhost:3000';

// Admin credentials (from seed data)
const ADMIN_CREDENTIALS = {
  email: 'admin@robloxacademy.com',
  password: 'password123',
};

let adminToken = '';
let createdTeacherId = null;
let invitationToken = '';

async function login() {
  console.log('\n=== Step 1: Admin Login ===');
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ADMIN_CREDENTIALS),
  });

  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));

  if (data.access_token) {
    adminToken = data.access_token;
    console.log('✓ Admin logged in successfully');
    return true;
  } else {
    console.log('✗ Login failed');
    return false;
  }
}

async function createTeacher() {
  console.log('\n=== Step 2: Create Teacher ===');
  const teacherData = {
    name: 'Jane Smith',
    email: `teacher_${Date.now()}@test.com`,
    class_code: 'TEST2025',
  };

  const response = await fetch(`${BASE_URL}/admin/teachers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(teacherData),
  });

  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));

  if (data.success) {
    createdTeacherId = data.teacher.id;
    invitationToken = data.invitation_token;
    console.log(`✓ Teacher created with ID: ${createdTeacherId}`);
    console.log(`✓ Invitation link: ${data.invitation_link}`);
    return true;
  } else {
    console.log('✗ Teacher creation failed');
    return false;
  }
}

async function getAllTeachers() {
  console.log('\n=== Step 3: Get All Teachers ===');
  const response = await fetch(`${BASE_URL}/admin/teachers`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));

  if (data.success) {
    console.log(`✓ Found ${data.count} teachers`);
    return true;
  } else {
    console.log('✗ Failed to get teachers');
    return false;
  }
}

async function getTeacherById() {
  console.log(`\n=== Step 4: Get Teacher By ID (${createdTeacherId}) ===`);
  const response = await fetch(`${BASE_URL}/admin/teachers/${createdTeacherId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));

  if (data.success) {
    console.log(`✓ Got teacher details`);
    return true;
  } else {
    console.log('✗ Failed to get teacher');
    return false;
  }
}

async function updateTeacher() {
  console.log(`\n=== Step 5: Update Teacher (${createdTeacherId}) ===`);
  const updateData = {
    name: 'Jane Smith Updated',
  };

  const response = await fetch(`${BASE_URL}/admin/teachers/${createdTeacherId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(updateData),
  });

  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));

  if (data.success) {
    console.log(`✓ Teacher updated`);
    return true;
  } else {
    console.log('✗ Failed to update teacher');
    return false;
  }
}

async function setupPassword() {
  console.log('\n=== Step 6: Setup Teacher Password ===');
  const passwordData = {
    token: invitationToken,
    password: 'SecurePass123!',
  };

  const response = await fetch(`${BASE_URL}/api/auth/setup-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passwordData),
  });

  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));

  if (data.success) {
    console.log(`✓ Teacher password set successfully`);
    console.log(`✓ Teacher auto-logged in`);
    return true;
  } else {
    console.log('✗ Failed to setup password');
    return false;
  }
}

async function getSystemStats() {
  console.log('\n=== Step 7: Get System Stats ===');
  const response = await fetch(`${BASE_URL}/admin/stats`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));

  if (data.success) {
    console.log(`✓ Got system stats`);
    return true;
  } else {
    console.log('✗ Failed to get stats');
    return false;
  }
}

async function deleteTeacher() {
  console.log(`\n=== Step 8: Delete Teacher (${createdTeacherId}) ===`);
  const response = await fetch(`${BASE_URL}/admin/teachers/${createdTeacherId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));

  if (data.success) {
    console.log(`✓ Teacher deleted`);
    return true;
  } else {
    console.log('✗ Failed to delete teacher');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('========================================');
  console.log('  TESTING ADMIN ENDPOINTS');
  console.log('========================================');

  try {
    if (!(await login())) return;
    if (!(await createTeacher())) return;
    if (!(await getAllTeachers())) return;
    if (!(await getTeacherById())) return;
    if (!(await updateTeacher())) return;
    if (!(await setupPassword())) return;
    if (!(await getSystemStats())) return;
    if (!(await deleteTeacher())) return;

    console.log('\n========================================');
    console.log('  ✓ ALL TESTS PASSED!');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n✗ Error:', error.message);
  }
}

runTests();
