const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function testAdminPassword() {
  try {
    console.log('=== TESTING ADMIN PASSWORD ===\n');

    // Get admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@ecoblox.build' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password_hash: true
      }
    });

    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✓ Admin user found:');
    console.log('  ID:', admin.id);
    console.log('  Name:', admin.name);
    console.log('  Email:', admin.email);
    console.log('  Role:', admin.role);
    console.log('  Password hash:', admin.password_hash ? admin.password_hash.substring(0, 20) + '...' : 'NONE');
    console.log();

    // Test passwords
    const testPasswords = [
      'o}`ZN4A%Qd3>5j',  // From seed file
      'o}\\`ZN4A%Qd3>5j', // With escaped backtick
      'o}`ZN4A%Qd3>5j',  // Copy paste version
    ];

    for (let i = 0; i < testPasswords.length; i++) {
      const password = testPasswords[i];
      console.log(`Testing password ${i + 1}: "${password}"`);
      console.log('  Length:', password.length);
      console.log('  Chars:', Array.from(password).map(c => `'${c}'`).join(', '));

      const isMatch = await bcrypt.compare(password, admin.password_hash);
      console.log('  Result:', isMatch ? '✅ MATCH!' : '❌ No match');
      console.log();
    }

    // Also test what the seed file would have generated
    console.log('Testing fresh hash generation:');
    const freshHash = await bcrypt.hash('o}`ZN4A%Qd3>5j', 10);
    const testFreshHash = await bcrypt.compare('o}`ZN4A%Qd3>5j', freshHash);
    console.log('  Fresh hash works:', testFreshHash ? '✅ YES' : '❌ NO');
    console.log('  Fresh hash:', freshHash.substring(0, 20) + '...');
    console.log('  Stored hash:', admin.password_hash.substring(0, 20) + '...');
    console.log();

    // Check if password_hash is null or empty
    if (!admin.password_hash || admin.password_hash.trim() === '') {
      console.log('❌ WARNING: password_hash is null or empty!');
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminPassword();
