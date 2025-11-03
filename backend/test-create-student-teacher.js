const axios = require('axios');

async function testCreateStudent() {
  try {
    // First, login as teacher
    console.log('1. Logging in as teacher...');
    const loginResponse = await axios.post('http://localhost:3400/api/auth/login', {
      email: 'teacher@robloxacademy.com',
      password: 'teacher123'
    });

    const token = loginResponse.data.access_token || loginResponse.data.token;
    console.log('✅ Login successful, token:', token ? token.substring(0, 20) + '...' : 'No token received');
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));

    // Now try to create a student
    console.log('\n2. Creating student...');
    const createResponse = await axios.post(
      'http://localhost:3400/api/teachers/students',
      {
        name: 'Test Student',
        email: 'teststudent@example.com',
        pin_code: ''
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Student created successfully:');
    console.log(JSON.stringify(createResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testCreateStudent();
