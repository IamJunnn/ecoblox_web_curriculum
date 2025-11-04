const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStudents() {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 10
    });

    console.log('=== Students in Database ===');
    students.forEach(student => {
      console.log(`ID: ${student.id}, Name: ${student.name}, Email: ${student.email}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();
