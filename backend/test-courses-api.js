const axios = require('axios');

const API_URL = 'http://localhost:3400';

async function testCoursesAPI() {
  try {
    console.log('=== TESTING COURSES API ===\n');

    // Step 1: Login as student
    console.log('1. Logging in as student (Testing)...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/student-login`, {
      email: 'junson@launchwith.co',
      pin: '9480'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    console.log(`   Student: ${loginResponse.data.session.name}`);
    console.log(`   ID: ${loginResponse.data.session.id}\n`);

    // Step 2: Fetch courses
    console.log('2. Fetching courses for student...');
    const coursesResponse = await axios.get(`${API_URL}/api/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Courses fetched successfully!\n');
    console.log('Response:', JSON.stringify(coursesResponse.data, null, 2));

    if (coursesResponse.data.courses && coursesResponse.data.courses.length > 0) {
      console.log(`\n📚 Found ${coursesResponse.data.courses.length} courses:\n`);
      coursesResponse.data.courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title}`);
        console.log(`   Game: ${course.game.name}`);
        console.log(`   Steps: ${course.total_steps}`);
        console.log(`   Order: ${course.course_order}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  No courses found!');
      console.log('   Student might not be enrolled in any games.');
    }

    // Step 3: Fetch a specific course
    if (coursesResponse.data.courses && coursesResponse.data.courses.length > 0) {
      const firstCourse = coursesResponse.data.courses[0];
      console.log(`\n3. Fetching details for course "${firstCourse.title}"...`);

      const courseResponse = await axios.get(`${API_URL}/api/courses/${firstCourse.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Course details fetched successfully!\n');
      console.log('Course:', JSON.stringify(courseResponse.data.course, null, 2));
    }

    console.log('\n=== TEST COMPLETE ===');
    console.log('✅ Courses API is working correctly!');
    console.log('   Students can now see courses on their dashboard.');

  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('\nFull error:', error);
  }
}

testCoursesAPI();
