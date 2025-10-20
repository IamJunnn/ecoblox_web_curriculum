const {
  getAllStudents,
  getStudentById,
  getStudentProgress,
  addStudent,
  addProgressEvent
} = require('./database');

console.log('🧪 Testing database...\n');

// Test 1: Get all students
console.log('Test 1: Get all students');
getAllStudents((err, students) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('✅ Found', students.length, 'students');
    students.forEach(s => console.log('  -', s.name));
  }

  // Test 2: Get Alice's progress
  console.log('\nTest 2: Get Alice\'s progress');
  getStudentProgress(1, (err, events) => {
    if (err) {
      console.error('❌ Error:', err);
    } else {
      console.log('✅ Found', events.length, 'events for Alice');
      events.forEach(e => console.log('  -', e.event_type, 'Level', e.level));
    }

    console.log('\n🎉 Database tests complete!');
    process.exit(0);
  });
});
