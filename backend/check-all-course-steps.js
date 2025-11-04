const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllCourses() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        id: { in: [8, 9, 10] }
      },
      orderBy: { id: 'asc' }
    });

    console.log('\n=== Course Steps in Database ===\n');
    courses.forEach(course => {
      console.log(`Course ${course.id}: ${course.title}`);
      console.log(`  total_steps in DB: ${course.total_steps}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllCourses();
