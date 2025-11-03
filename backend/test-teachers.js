const axios = require('axios');

const API_URL = 'http://localhost:3400';

async function testTeachers() {
  try {
    // Login as admin
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@ecoblox.build',
      password: 'admin123',
    });

    const { access_token } = loginResponse.data;

    const config = {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    // Test GET /admin/teachers
    console.log('Testing GET /admin/teachers...');
    const response = await axios.get(`${API_URL}/admin/teachers`, config);
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testTeachers();
