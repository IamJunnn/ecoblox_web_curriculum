const axios = require('axios');

const BASE_URL = 'http://localhost:3400';

async function testStudentProgress() {
  try {
    // First, let's get the student info
    console.log('=== Testing Student Progress ===\n');

    // Login as the student to get their info
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'junseop@ecoblox.org',
      password: 'password123'
    });

    const token = loginResponse.data.access_token;
    const studentId = loginResponse.data.user.id;

    console.log(`Student ID: ${studentId}`);
    console.log(`Student Name: ${loginResponse.data.user.name}\n`);

    // Get course 3 progress
    console.log('=== Course 3 Progress ===');
    const courseProgressResponse = await axios.get(
      `${BASE_URL}/api/progress/student/${studentId}/course/3`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const events = courseProgressResponse.data.progress_events;
    console.log(`\nTotal events: ${events.length}\n`);

    // Filter step_checked events
    const stepEvents = events.filter(e => e.event_type === 'step_checked');
    console.log(`Step checked events: ${stepEvents.length}`);

    // Show each step event
    stepEvents.forEach((event, idx) => {
      console.log(`\nStep Event ${idx + 1}:`);
      console.log(`  Event Type: ${event.event_type}`);
      console.log(`  Level: ${event.level}`);
      console.log(`  Data:`, event.data);
      console.log(`  Timestamp: ${event.timestamp}`);
    });

    // Count unique steps
    const uniqueSteps = new Set();
    stepEvents.forEach(event => {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      const stepKey = `${event.level}-${data.step}`;
      uniqueSteps.add(stepKey);
      console.log(`\nProcessing: Level ${event.level}, Step ${data.step} -> Key: ${stepKey}`);
    });

    console.log(`\n=== SUMMARY ===`);
    console.log(`Unique steps completed: ${uniqueSteps.size}`);
    console.log(`Step keys:`, Array.from(uniqueSteps));
    console.log(`Expected: 4 steps (Level 1: steps 0, 1, 2, 3)`);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testStudentProgress();
