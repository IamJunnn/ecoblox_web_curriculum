const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./database.db'
    }
  }
});

async function checkCourse3Completion() {
  try {
    // Get student
    const student = await prisma.user.findFirst({
      where: { role: 'student' }
    });

    if (!student) {
      console.log('No student found');
      return;
    }

    console.log(`Student: ${student.name} (ID: ${student.id})`);
    console.log('');

    // Check course 3 progress events
    const course3Events = await prisma.progressEvent.findMany({
      where: {
        user_id: student.id,
        course_id: 3
      },
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    console.log(`Course 3 (Studio Basics) - Recent Events (${course3Events.length}):`);
    console.log('─'.repeat(80));

    course3Events.forEach((event, idx) => {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      console.log(`${idx + 1}. ${event.event_type.padEnd(20)} Level: ${event.level_number}  Data:`, JSON.stringify(data));
    });

    // Check for quest_completed event
    const questCompleted = course3Events.find(e => e.event_type === 'quest_completed');
    const courseCompleted = course3Events.find(e => e.event_type === 'course_completed');

    console.log('');
    console.log('Completion Status:');
    console.log(`  quest_completed event: ${questCompleted ? '✓ YES' : '✗ NO'}`);
    console.log(`  course_completed event: ${courseCompleted ? '✓ YES' : '✗ NO'}`);

    // Check badges
    const badges = await prisma.studentBadge.findMany({
      where: { user_id: student.id },
      include: { course: true }
    });

    console.log('');
    console.log(`Badges Earned (${badges.length}):`);
    console.log('─'.repeat(80));
    badges.forEach((badge, idx) => {
      console.log(`${idx + 1}. ${badge.badge_name} (Course: ${badge.course.title})`);
    });

    // Check course 4 enrollment
    const course4Enrollment = await prisma.gameEnrollment.findFirst({
      where: {
        user_id: student.id,
        game_id: 4 // Course 4 game
      }
    });

    console.log('');
    console.log('Course 4 Enrollment:');
    console.log(`  Enrolled in Course 4: ${course4Enrollment ? '✓ YES' : '✗ NO'}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourse3Completion();
