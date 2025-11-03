const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStudents() {
  try {
    console.log('=== All Students ===\n');

    const students = await prisma.user.findMany({
      where: { role: 'student' },
      select: {
        id: true,
        email: true,
        name: true,
        class_codes: true
      }
    });

    students.forEach(student => {
      console.log(`ID: ${student.id}`);
      console.log(`Name: ${student.name}`);
      console.log(`Email: ${student.email}`);
      console.log(`Class Codes: ${student.class_codes}`);
      console.log('---');
    });

    if (students.length > 0) {
      const studentId = students[0].id;
      console.log(`\n=== Checking progress for student ${studentId} (${students[0].name}) ===\n`);

      const progressEvents = await prisma.progressEvent.findMany({
        where: {
          user_id: studentId,
          course_id: 3
        },
        orderBy: { timestamp: 'desc' }
      });

      console.log(`Total progress events for course 3: ${progressEvents.length}\n`);

      progressEvents.forEach((event, idx) => {
        console.log(`Event ${idx + 1}:`);
        console.log(`  Type: ${event.event_type}`);
        console.log(`  Level Number: ${event.level_number}`);
        console.log(`  Step Number: ${event.step_number}`);
        console.log(`  Data: ${event.data}`);
        console.log(`  Timestamp: ${event.timestamp}`);
        console.log('---');
      });

      // Count step_checked events
      const stepChecked = progressEvents.filter(e => e.event_type === 'step_checked');
      console.log(`\nStep checked events: ${stepChecked.length}`);

      // Show unique step combinations
      const uniqueSteps = new Set();
      stepChecked.forEach(event => {
        uniqueSteps.add(`L${event.level_number}-S${event.step_number}`);
      });
      console.log(`Unique steps: ${uniqueSteps.size}`);
      console.log(`Steps:`, Array.from(uniqueSteps));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();
