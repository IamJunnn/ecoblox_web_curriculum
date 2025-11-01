const axios = require('axios');

const API_URL = 'http://localhost:3400';

async function testAdminEndpoints() {
  try {
    console.log('Testing Admin Login...');

    // First, login as admin
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@ecoblox.build',
      password: 'admin123',
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Admin login successful');

    // Set authorization header for subsequent requests
    const config = {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    // Test GET /admin/students
    console.log('\nTesting GET /admin/students...');
    const studentsResponse = await axios.get(`${API_URL}/admin/students`, config);
    console.log('✅ Students fetched successfully');
    console.log(`Found ${studentsResponse.data.students?.length || 0} students`);
    if (studentsResponse.data.students?.length > 0) {
      console.log('First student:', JSON.stringify(studentsResponse.data.students[0], null, 2));
    }

    // Test GET /admin/teachers
    console.log('\nTesting GET /admin/teachers...');
    const teachersResponse = await axios.get(`${API_URL}/admin/teachers`, config);
    console.log('✅ Teachers fetched successfully');
    console.log(`Found ${teachersResponse.data.teachers?.length || 0} teachers`);

    // Test GET /admin/stats
    console.log('\nTesting GET /admin/stats...');
    const statsResponse = await axios.get(`${API_URL}/admin/stats`, config);
    console.log('✅ Stats fetched successfully');
    console.log('Stats:', statsResponse.data);

    // Test GET /admin/games
    console.log('\nTesting GET /admin/games...');
    const gamesResponse = await axios.get(`${API_URL}/admin/games`, config);
    console.log('✅ Games fetched successfully');
    console.log(`Found ${gamesResponse.data.length} games`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('Authentication failed. Check admin credentials.');
    }
  }
}

testAdminEndpoints();