const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkAndCreateAdmin() {
  try {
    // Check if admin exists
    const admin = await prisma.user.findFirst({
      where: {
        role: 'admin',
      },
    });

    if (admin) {
      console.log('Admin exists:', {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      });
    } else {
      console.log('No admin found. Creating admin...');

      // Create admin user
      const hashedPassword = await bcrypt.hash('EcoAdmin2024!', 10);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@ecoblox.org',
          name: 'System Admin',
          password_hash: hashedPassword,
          role: 'admin',
          is_verified: true,
        },
      });

      console.log('Admin created successfully:', {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      });
    }

    // Also check for any users in the database
    const userCount = await prisma.user.count();
    console.log(`\nTotal users in database: ${userCount}`);

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    console.log('\nUsers by role:');
    usersByRole.forEach(group => {
      console.log(`- ${group.role}: ${group._count}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateAdmin();