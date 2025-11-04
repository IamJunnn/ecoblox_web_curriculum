const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== DATABASE CHECK ===\n');

    // Count users
    const userCount = await prisma.user.count();
    console.log('Total users in database:', userCount);

    // Check for admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@ecoblox.build' },
      select: { id: true, name: true, email: true, role: true, password_hash: true }
    });

    console.log('\nAdmin user:');
    if (admin) {
      console.log('  ID:', admin.id);
      console.log('  Name:', admin.name);
      console.log('  Email:', admin.email);
      console.log('  Role:', admin.role);
      console.log('  Has password hash:', admin.password_hash ? 'YES' : 'NO');
    } else {
      console.log('  NOT FOUND');
    }

    // List all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });

    console.log('\n=== ALL USERS ===');
    allUsers.forEach(user => {
      console.log(`  [${user.id}] ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log('\n=== DATABASE URL ===');
    console.log('Connected to:', process.env.DATABASE_URL ? 'PostgreSQL (Neon)' : 'Not set');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
