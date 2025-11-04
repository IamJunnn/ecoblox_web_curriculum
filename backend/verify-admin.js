const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function verifyAdmin() {
  console.log('\n========== ADMIN VERIFICATION ==========');

  try {
    // Check for admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!admin) {
      console.log('❌ No admin user found in database!');
      console.log('Creating admin user...');

      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@ecoblox.build',
          name: 'Admin User',
          role: 'admin',
          password_hash: hashedPassword,
          is_verified: true,
        }
      });

      console.log('✓ Admin user created:', {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role
      });
    } else {
      console.log('✓ Admin user found:', {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        hasPassword: !!admin.password_hash,
        isVerified: admin.is_verified
      });

      // Test password
      console.log('\n🔐 Testing password verification...');
      const testPasswords = ['admin123', 'Admin123', 'admin'];

      for (const pwd of testPasswords) {
        const isValid = await bcrypt.compare(pwd, admin.password_hash);
        console.log(`Password '${pwd}': ${isValid ? '✓ VALID' : '❌ INVALID'}`);
      }
    }

    console.log('========================================\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdmin();
