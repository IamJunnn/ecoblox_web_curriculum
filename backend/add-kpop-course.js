const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addKpopCourse() {
  try {
    console.log('🎤 Adding K-Pop Battery Game and Course 4...\n');

    // Check if game already exists
    const existingGame = await prisma.game.findFirst({
      where: { name: 'K-Pop Battery Sustainability' }
    });

    let kpopGame;
    if (existingGame) {
      console.log('✓ K-Pop game already exists');
      kpopGame = existingGame;
    } else {
      // Create the K-Pop Battery Game
      kpopGame = await prisma.game.create({
        data: {
          name: 'K-Pop Battery Sustainability',
          description: 'Build a K-Pop concert game powered by upcycled EV batteries',
          display_order: 1, // Make it first since it's the intro
          is_active: true,
        },
      });
      console.log('✅ Created K-Pop Battery Game:', kpopGame.name);
    }

    // Check if course already exists
    const existingCourse = await prisma.course.findFirst({
      where: {
        game_id: kpopGame.id,
        course_order: 4
      }
    });

    if (existingCourse) {
      console.log('✓ Course 4 already exists, updating...');
      await prisma.course.update({
        where: { id: existingCourse.id },
        data: {
          title: 'Introduction to K-Pop Battery Game',
          description: 'Play the game and understand what you will be building',
          total_steps: 3, // Step 1: Overview, Step 2: Play, Step 3: Quiz
          badge_name: 'Game Explorer',
          badge_icon: '🎮',
          badge_message: 'Great job! You understand the K-Pop Battery Game!',
          requires_course: null, // No prerequisite for now
          url: 'https://www.roblox.com/games/98002235488946/Ecoblox-K-Pop-Battery-Sustainability',
          display_order: 4,
        }
      });
      console.log('✅ Updated Course 4');
    } else {
      // Create Course 4
      const course4 = await prisma.course.create({
        data: {
          game_id: kpopGame.id,
          course_order: 4,
          title: 'Introduction to K-Pop Battery Game',
          description: 'Play the game and understand what you will be building',
          total_steps: 3, // Step 1: Overview, Step 2: Play, Step 3: Quiz
          badge_name: 'Game Explorer',
          badge_icon: '🎮',
          badge_message: 'Great job! You understand the K-Pop Battery Game!',
          requires_course: null, // No prerequisite for now
          url: 'https://www.roblox.com/games/98002235488946/Ecoblox-K-Pop-Battery-Sustainability',
          display_order: 4,
        },
      });
      console.log('✅ Created Course 4:', course4.title);
      console.log('   - Total steps:', course4.total_steps);
      console.log('   - Badge:', course4.badge_icon, course4.badge_name);
      console.log('   - Game URL:', course4.url);
    }

    console.log('\n🎉 K-Pop course setup complete!');
    console.log('\n📋 Course Structure:');
    console.log('   Level 1: Overview & Play');
    console.log('   - Step 0: Game Overview (what we are building)');
    console.log('   - Step 1: Click to Play (Roblox link)');
    console.log('   - Step 2: Quiz (3 questions)');
    console.log('\n📝 Quiz Questions:');
    console.log('   1. What is the main goal of the game?');
    console.log('   2. How many kW do we need to power 2 hours of K-Pop concert?');
    console.log('   3. What happens if the concert runs out of power?');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

addKpopCourse();
