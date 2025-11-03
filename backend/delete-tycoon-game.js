const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteTycoonGame() {
  try {
    console.log('Looking for Roblox Tycoon Game...');

    const tycoonGame = await prisma.game.findFirst({
      where: {
        name: {
          contains: 'Tycoon'
        }
      }
    });

    if (tycoonGame) {
      console.log(`Found game: ${tycoonGame.name} (ID: ${tycoonGame.id})`);

      // Delete related courses first
      console.log('Deleting related courses...');
      const deletedCourses = await prisma.course.deleteMany({
        where: { game_id: tycoonGame.id }
      });
      console.log(`  Deleted ${deletedCourses.count} courses`);

      // Delete related class codes
      console.log('Deleting related class codes...');
      const deletedCodes = await prisma.classCode.deleteMany({
        where: { game_id: tycoonGame.id }
      });
      console.log(`  Deleted ${deletedCodes.count} class codes`);

      // Delete related enrollments
      console.log('Deleting related enrollments...');
      const deletedEnrollments = await prisma.gameEnrollment.deleteMany({
        where: { game_id: tycoonGame.id }
      });
      console.log(`  Deleted ${deletedEnrollments.count} enrollments`);

      // Now delete the game
      console.log('Deleting game...');
      await prisma.game.delete({
        where: { id: tycoonGame.id }
      });

      console.log('✅ Successfully deleted Roblox Tycoon Game and all related data');
    } else {
      console.log('⚠️  Roblox Tycoon Game not found');
    }

    // Show remaining games
    const games = await prisma.game.findMany();
    console.log(`\nRemaining games (${games.length}):`);
    games.forEach(game => {
      console.log(`  - ${game.name} (ID: ${game.id})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTycoonGame();
