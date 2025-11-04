const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  console.log('\n========== RESETTING ADMIN PASSWORD ==========');

  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!admin) {
      console.log('❌ No admin user found!');
      return;
    }

    console.log('Found admin user:', admin.email);

    // Reset password to 'admin123'
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: admin.id },
      data: {
        password_hash: hashedPassword,
        is_verified: true
      }
    });

    console.log('✓ Password updated successfully!');
    console.log('Email:', admin.email);
    console.log('New Password:', newPassword);

    // Verify the password works
    const updated = await prisma.user.findUnique({ where: { id: admin.id } });
    const isValid = await bcrypt.compare(newPassword, updated.password_hash);
    console.log('Verification:', isValid ? '✓ Password works!' : '❌ Password failed!');

    console.log('==============================================\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
