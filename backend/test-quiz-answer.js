const axios = require('axios');

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

axios.post('http://localhost:3400/api/progress', testData)
  .then(response => {
    console.log('Success:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  });
