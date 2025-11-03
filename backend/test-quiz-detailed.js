const axios = require('axios');

async function test() {
  try {
    const testData = {
      student_id: 1,
      course_id: 3,
      event_type: 'quiz_answered',
      level: 1,
      data: {
        question: 'What is the Mezzanine in Roblox Studio?',
        answer_index: 1,
        answer_text: 'The central toolbar area with control buttons',
        correct: true
      }
    };

    console.log('Sending request:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://localhost:3400/api/progress', testData);
    console.log('Success:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error details:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response data:', error.response?.data);
    console.error('Full error:', error.message);
    if (error.response?.data) {
      console.error('Full response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

test();
