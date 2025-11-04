const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourses() {
  const courses = await prisma.course.findMany({
    include: {
      game: true
    },
    orderBy: [
      { game_id: 'asc' },
      { course_order: 'asc' }
    ]
  });

  console.log('=== ALL COURSES IN DATABASE ===\n');

  const games = {};
  courses.forEach(course => {
    if (!games[course.game.name]) {
      games[course.game.name] = [];
    }
    games[course.game.name].push(course);
  });

  for (const [gameName, gameCourses] of Object.entries(games)) {
    console.log(`📚 Game: ${gameName}`);
    gameCourses.forEach(course => {
      console.log(`   ${course.course_order}. ${course.title}`);
      console.log(`      Description: ${course.description || 'N/A'}`);
      console.log(`      Total Steps: ${course.total_steps}`);
      console.log(`      Badge: ${course.badge_name} ${course.badge_icon || ''}`);
    });
    console.log();
  }

  console.log('Total courses:', courses.length);

  // Check for Kpop
  const kpopCourses = courses.filter(c =>
    c.title.toLowerCase().includes('kpop') ||
    c.title.toLowerCase().includes('k-pop') ||
    c.description?.toLowerCase().includes('kpop')
  );

  console.log('\nKpop courses found:', kpopCourses.length);

  await prisma.$disconnect();
}

checkCourses().catch(console.error);
