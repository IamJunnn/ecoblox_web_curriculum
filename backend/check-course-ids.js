const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourseIds() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { course_order: 'asc' }
    });

    console.log('=== COURSE IDs ===\n');
    courses.forEach(c => {
      console.log(`ID: ${c.id} | Order: ${c.course_order} | Title: ${c.title}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourseIds();
