const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGames() {
  try {
    console.log('Checking games in database...');
    const games = await prisma.game.findMany({
      include: {
        courses: true,
      },
    });

    console.log(`Found ${games.length} games:`);
    games.forEach(game => {
      console.log(`\nGame ID: ${game.id}`);
      console.log(`Name: ${game.name}`);
      console.log(`Description: ${game.description}`);
      console.log(`Active: ${game.is_active}`);
      console.log(`Courses: ${game.courses.length}`);
    });

    if (games.length === 0) {
      console.log('\n⚠️  No games found! Creating K-pop game...');

      const kpopGame = await prisma.game.create({
        data: {
          name: 'K-pop Basics',
          description: 'Learn the basics of K-pop culture and music',
          display_order: 1,
          is_active: true,
        },
      });

      console.log('✅ Created K-pop Basics game with ID:', kpopGame.id);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGames();
