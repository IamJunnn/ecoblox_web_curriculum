const axios = require('axios');

const API_URL = 'http://localhost:3400';

async function testStudentDetail() {
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

    // Test GET /admin/students/17
    console.log('Testing GET /admin/students/17...');
    const response = await axios.get(`${API_URL}/admin/students/17`, config);
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testStudentDetail();
