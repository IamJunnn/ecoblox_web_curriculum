const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== All Users in Database ===\n');

  const users = await prisma.user.findMany({
    orderBy: { role: 'asc' },
  });

  users.forEach((user) => {
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Has Password: ${user.password ? 'Yes' : 'No'}`);
    console.log(`Pin Code: ${user.pin_code || 'N/A'}`);
    console.log('---\n');
  });

  console.log(`Total: ${users.length} users`);
  console.log(`\nBreakdown:`);
  const breakdown = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});
  Object.entries(breakdown).forEach(([role, count]) => {
    console.log(`  ${role}: ${count}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
