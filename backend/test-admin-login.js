const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    console.log('Testing admin login...\n');

    const response = await fetch('http://localhost:3400/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@robloxacademy.com',
        password: 'password123',
      }),
    });

    const data = await response.json();

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.access_token) {
      console.log('\n✓ Login successful!');
      console.log('User:', data.user.name, `(${data.user.role})`);
      console.log('Token:', data.access_token.substring(0, 50) + '...');
    } else {
      console.log('\n✗ Login failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAdminLogin();
