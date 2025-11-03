const axios = require('axios');

const API_URL = 'http://localhost:3400';

async function testTeacherEndpoint() {
  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@ecoblox.org',
      password: 'admin123'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');

    // Step 2: Test GET /admin/teachers with token
    console.log('\n2. Fetching teachers with auth token...');
    const teachersResponse = await axios.get(`${API_URL}/admin/teachers`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Teachers fetched successfully');
    console.log('Response:', JSON.stringify(teachersResponse.data, null, 2));

    // Step 3: Test without token
    console.log('\n3. Testing without auth token (should fail)...');
    try {
      await axios.get(`${API_URL}/admin/teachers`);
      console.log('❌ Request succeeded without token (security issue!)');
    } catch (error) {
      console.log('✅ Request correctly failed without token');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testTeacherEndpoint();
