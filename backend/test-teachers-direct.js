const axios = require('axios');

const API_URL = 'http://localhost:3400';

async function testTeachers() {
  try {
    // Login as admin
    console.log('Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@ecoblox.build',
      password: 'admin123',
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful\n');

    // Test GET /admin/teachers
    console.log('Fetching teachers from /admin/teachers...');
    const response = await axios.get(`${API_URL}/admin/teachers`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ SUCCESS!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    if (response.data.teachers) {
      console.log(`\nFound ${response.data.teachers.length} teachers`);
      response.data.teachers.forEach((teacher, index) => {
        console.log(`\nTeacher ${index + 1}:`, {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          class_codes: teacher.class_codes,
          student_count: teacher.student_count,
          is_verified: teacher.is_verified
        });
      });
    }

  } catch (error) {
    console.error('❌ ERROR');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
  }
}

testTeachers();
