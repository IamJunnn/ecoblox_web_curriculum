const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetTeacherPassword() {
  try {
    // Find teacher user
    const teacher = await prisma.user.findFirst({
      where: {
        email: 'teacher@robloxacademy.com',
        role: 'teacher'
      },
    });

    if (!teacher) {
      console.log('Teacher not found. Creating teacher account...');

      const hashedPassword = await bcrypt.hash('teacher123', 10);

      const newTeacher = await prisma.user.create({
        data: {
          name: 'Teacher Demo',
          email: 'teacher@robloxacademy.com',
          password_hash: hashedPassword,
          role: 'teacher',
          is_verified: true
        }
      });

      console.log('✅ Teacher account created successfully');
      console.log('Email: teacher@robloxacademy.com');
      console.log('Password: teacher123');
      return;
    }

    // Reset password to "teacher123"
    const hashedPassword = await bcrypt.hash('teacher123', 10);

    await prisma.user.update({
      where: { id: teacher.id },
      data: {
        password_hash: hashedPassword,
      },
    });

    console.log('✅ Teacher password reset successfully');
    console.log('Email: teacher@robloxacademy.com');
    console.log('Password: teacher123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetTeacherPassword();