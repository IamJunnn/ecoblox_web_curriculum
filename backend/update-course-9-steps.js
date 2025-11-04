const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateCourse9() {
  try {
    console.log('Updating Course 9 total_steps from 4 to 7...');
    
    const result = await prisma.course.update({
      where: { id: 9 },
      data: { total_steps: 7 }
    });

    console.log('✓ Updated successfully!');
    console.log(`  Course: ${result.title}`);
    console.log(`  New total_steps: ${result.total_steps}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCourse9();
