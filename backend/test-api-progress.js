const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3400,
  path: '/admin/students',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('=== Admin Students API Response ===\n');
      if (json.students) {
        json.students.forEach((student) => {
          console.log(`Student: ${student.name}`);
          console.log(`  Progress: ${student.progress}%`);
          console.log(`  Total XP: ${student.totalXP}`);
          console.log(`  Badges: ${student.badges}`);
          console.log('');
        });
      } else {
        console.log('Response:', json);
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();
