const axios = require('axios');

const API_URL = 'http://localhost:3400';

async function testCreateTeacher() {
  try {
    // Login as admin
    console.log('Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@ecoblox.build',
      password: 'admin123',
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Admin login successful');

    // Create test teacher
    const testTeacher = {
      name: 'Test Teacher',
      email: `test.teacher.${Date.now()}@example.com`,
      class_code: `TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };

    console.log('\nCreating teacher with:', testTeacher);

    const createResponse = await axios.post(`${API_URL}/admin/teachers`, testTeacher, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    console.log('✅ Teacher created successfully!');
    console.log('Response:', JSON.stringify(createResponse.data, null, 2));
    console.log('\nInvitation link:', createResponse.data.invitation_link);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.message) {
      console.log('Error details:', error.response.data.message);
    }
  }
}

testCreateTeacher();