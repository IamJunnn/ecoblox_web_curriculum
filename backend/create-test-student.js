const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestStudent() {
  try {
    // Check if test student exists
    const existingStudent = await prisma.user.findFirst({
      where: {
        email: 'student@test.com',
      },
    });

    if (existingStudent) {
      // Update PIN code
      await prisma.user.update({
        where: { id: existingStudent.id },
        data: {
          pin_code: '1234',
        },
      });

      console.log('✅ Test student PIN updated');
      console.log('Email: student@test.com');
      console.log('PIN: 1234');
      return;
    }

    // Create new test student
    const newStudent = await prisma.user.create({
      data: {
        name: 'Test Student',
        email: 'student@test.com',
        pin_code: '1234',
        role: 'student',
        is_verified: true,
      }
    });

    console.log('✅ Test student created successfully');
    console.log('Email: student@test.com');
    console.log('PIN: 1234');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestStudent();