const axios = require('axios');

async function testEmailSend() {
  try {
    // First login as admin to get token
    console.log('Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3401/api/auth/login', {
      email: 'admin@ecoblox.com',
      password: 'admin123'
    });

    const token = loginResponse.data.access_token;
    console.log('✓ Login successful');

    // Create a test teacher to trigger email send
    console.log('\nCreating teacher to test email...');
    const createResponse = await axios.post(
      'http://localhost:3401/admin/teachers',
      {
        name: 'Test Teacher',
        email: 'your-lovejsson@gmail.com', // Send to the configured Gmail
        class_code: 'TEST999'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('\n✓ Teacher created successfully!');
    console.log('Teacher ID:', createResponse.data.teacher.id);
    console.log('Invitation link:', createResponse.data.invitation_link);
    console.log('\nCheck the backend logs for email sending status...');
    console.log('Also check your email inbox: your-lovejsson@gmail.com');

  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testEmailSend();
