const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCourses() {
  try {
    console.log('=== All Courses ===\n');

    const courses = await prisma.course.findMany({
      orderBy: { id: 'asc' }
    });

    courses.forEach(course => {
      console.log(`Course ID: ${course.id}`);
      console.log(`Title: ${course.title}`);
      console.log(`total_steps: ${course.total_steps}`);
      console.log(`game_id: ${course.game_id}`);
      console.log(`course_order: ${course.course_order}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourses();
