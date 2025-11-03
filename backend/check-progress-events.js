const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProgressEvents() {
  try {
    console.log('=== Progress Events for Course 3 ===\n');

    const events = await prisma.progressEvent.findMany({
      where: {
        course_id: 3,
        event_type: 'step_checked'
      },
      orderBy: { timestamp: 'desc' }
    });

    console.log(`Total step_checked events: ${events.length}\n`);

    events.forEach(event => {
      console.log(`User: ${event.user_id}`);
      console.log(`Level: ${event.level_number}, Step: ${event.step_number}`);
      console.log(`is_checked: ${event.is_checked}`);
      console.log(`data: ${event.data}`);
      console.log(`timestamp: ${event.timestamp}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProgressEvents();
