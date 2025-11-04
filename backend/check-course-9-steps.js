const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourse9Steps() {
  try {
    const student = await prisma.user.findFirst({
      where: {
        email: 'johnny@student.com',
        role: 'student'
      }
    });

    if (!student) {
      console.log('Student not found');
      return;
    }

    // Get Course 9 details
    const course = await prisma.course.findUnique({
      where: { id: 9 }
    });

    console.log('\n=== Course 9 Details ===');
    console.log(`Title: ${course.title}`);
    console.log(`Total Steps (from DB): ${course.total_steps}`);

    // Get all step_checked events for Course 9
    const stepEvents = await prisma.progressEvent.findMany({
      where: {
        user_id: student.id,
        course_id: 9,
        event_type: 'step_checked'
      },
      orderBy: [
        { level_number: 'asc' },
        { step_number: 'asc' }
      ]
    });

    console.log(`\n=== Step Events (${stepEvents.length} total) ===`);
    stepEvents.forEach(event => {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      console.log(`Level ${event.level_number}, Step ${event.step_number}: is_checked=${event.is_checked}, data:`, data);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourse9Steps();
