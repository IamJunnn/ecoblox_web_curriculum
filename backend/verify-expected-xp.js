const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyXP() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        id: { in: [8, 9, 10] }
      },
      orderBy: { id: 'asc' }
    });

    console.log('\n=== Expected XP Calculation ===\n');
    
    let totalSteps = 0;
    let totalXP = 0;
    
    courses.forEach(course => {
      const courseXP = course.total_steps * 10;
      totalSteps += course.total_steps;
      totalXP += courseXP;
      
      console.log(`Course ${course.id}: ${course.title}`);
      console.log(`  Steps: ${course.total_steps}`);
      console.log(`  XP: ${courseXP}`);
      console.log('');
    });

    console.log('=========================');
    console.log(`Total Steps: ${totalSteps}`);
    console.log(`Total XP: ${totalXP}`);
    console.log('=========================\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyXP();
