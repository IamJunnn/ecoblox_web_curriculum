const axios = require('axios');

const API_URL = 'http://localhost:3400';

async function testStudentCreationWithEmail() {
  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@ecoblox.build',
      password: 'admin123',
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful\n');

    // Step 2: Create a test student
    console.log('2. Creating a test student...');
    const studentData = {
      name: 'Test Student for Email',
      email: 'teststudent' + Date.now() + '@example.com', // Unique email
      // pin_code will be auto-generated
    };

    console.log('Student data:', studentData);

    const createResponse = await axios.post(
      `${API_URL}/admin/students`,
      studentData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('\n✅ Student created successfully!');
    console.log('Response:', JSON.stringify(createResponse.data, null, 2));

    if (createResponse.data.emailSent) {
      console.log('\n📧 ✅ Email was sent successfully!');
    } else {
      console.log('\n📧 ⚠️  Email was NOT sent');
      console.log('   Check backend logs for error details');
    }

    console.log('\n💡 Student Login Credentials:');
    console.log('   Email:', createResponse.data.student?.email || createResponse.data.email);
    console.log('   PIN Code:', createResponse.data.student?.pin || createResponse.data.pin || 'Not found');
    console.log('\n📝 Message:', createResponse.data.message);

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testStudentCreationWithEmail();
