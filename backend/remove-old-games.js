const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeOldGames() {
  try {
    console.log('🗑️  Removing old games (keeping only K-Pop)...\n');

    // Find all games
    const allGames = await prisma.game.findMany({
      include: {
        courses: true
      }
    });

    console.log('📋 Current games:');
    allGames.forEach(game => {
      console.log(`   - ${game.name} (${game.courses.length} courses)`);
    });
    console.log();

    // Find games to delete (NOT K-Pop)
    const gamesToDelete = allGames.filter(game =>
      game.name !== 'K-Pop Battery Sustainability'
    );

    if (gamesToDelete.length === 0) {
      console.log('✓ No games to delete. Only K-Pop game exists!');
      return;
    }

    console.log('🗑️  Deleting these games:');
    for (const game of gamesToDelete) {
      console.log(`   - ${game.name}`);

      // First, delete student badges for courses in this game
      const courseIds = game.courses.map(c => c.id);
      if (courseIds.length > 0) {
        const deletedBadges = await prisma.studentBadge.deleteMany({
          where: { course_id: { in: courseIds } }
        });
        console.log(`     Deleted ${deletedBadges.count} student badges`);

        // Delete progress events
        const deletedProgress = await prisma.progressEvent.deleteMany({
          where: { course_id: { in: courseIds } }
        });
        console.log(`     Deleted ${deletedProgress.count} progress events`);
      }

      // Delete all courses for this game
      const deletedCourses = await prisma.course.deleteMany({
        where: { game_id: game.id }
      });
      console.log(`     Deleted ${deletedCourses.count} courses`);

      // Delete class codes
      const deletedClassCodes = await prisma.classCode.deleteMany({
        where: { game_id: game.id }
      });
      console.log(`     Deleted ${deletedClassCodes.count} class codes`);

      // Delete game enrollments
      const deletedEnrollments = await prisma.gameEnrollment.deleteMany({
        where: { game_id: game.id }
      });
      console.log(`     Deleted ${deletedEnrollments.count} game enrollments`);

      // Delete the game itself
      await prisma.game.delete({
        where: { id: game.id }
      });
      console.log(`     ✅ Deleted game: ${game.name}\n`);
    }

    // Show remaining games
    const remainingGames = await prisma.game.findMany({
      include: {
        courses: true
      }
    });

    console.log('✅ Remaining games:');
    remainingGames.forEach(game => {
      console.log(`   📚 ${game.name}`);
      game.courses.forEach(course => {
        console.log(`      ${course.course_order}. ${course.title}`);
      });
    });

    console.log('\n🎉 Cleanup complete! Only K-Pop game remains.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

removeOldGames();
