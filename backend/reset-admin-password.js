const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    // Find admin user
    const admin = await prisma.user.findFirst({
      where: {
        email: 'admin@ecoblox.build',
      },
    });

    if (!admin) {
      console.log('Admin not found with email admin@ecoblox.build');
      return;
    }

    // Reset password to "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await prisma.user.update({
      where: { id: admin.id },
      data: {
        password_hash: hashedPassword,
      },
    });

    console.log('✅ Admin password reset successfully');
    console.log('Email: admin@ecoblox.build');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();