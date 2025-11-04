const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addCourses123() {
  try {
    console.log('📚 Adding Courses 1-3 to K-Pop Battery Game...\n');

    // Find K-Pop game
    const kpopGame = await prisma.game.findFirst({
      where: { name: 'K-Pop Battery Sustainability' }
    });

    if (!kpopGame) {
      console.log('❌ K-Pop game not found!');
      return;
    }

    console.log('✓ Found K-Pop game:', kpopGame.name);
    console.log();

    // Check existing courses
    const existingCourses = await prisma.course.findMany({
      where: { game_id: kpopGame.id },
      orderBy: { course_order: 'asc' }
    });

    console.log('Current courses:');
    existingCourses.forEach(c => console.log(`   ${c.course_order}. ${c.title}`));
    console.log();

    // Define courses 1-3
    const coursesToAdd = [
      {
        game_id: kpopGame.id,
        course_order: 1,
        title: 'Install Roblox Studio',
        description: 'Download and install Roblox Studio on your computer',
        total_steps: 5,
        badge_name: 'Starter Badge',
        badge_icon: '🎯',
        badge_message: 'Great job! You have Roblox Studio installed!',
        requires_course: null,
        display_order: 1,
      },
      {
        game_id: kpopGame.id,
        course_order: 2,
        title: 'Create Roblox Account',
        description: 'Set up your Roblox developer account',
        total_steps: 4,
        badge_name: 'Account Badge',
        badge_icon: '👤',
        badge_message: 'Awesome! You are now a Roblox developer!',
        requires_course: null, // Will update after creation
        display_order: 2,
      },
      {
        game_id: kpopGame.id,
        course_order: 3,
        title: 'Studio Basics',
        description: 'Learn the Roblox Studio interface and basic tools',
        total_steps: 8,
        badge_name: 'Explorer Badge',
        badge_icon: '🔍',
        badge_message: 'You know your way around Roblox Studio!',
        requires_course: null, // Will update after creation
        display_order: 3,
      },
    ];

    const createdCourses = [];

    for (const courseData of coursesToAdd) {
      // Check if course already exists
      const existing = await prisma.course.findFirst({
        where: {
          game_id: kpopGame.id,
          course_order: courseData.course_order
        }
      });

      if (existing) {
        console.log(`✓ Course ${courseData.course_order} already exists, skipping...`);
        createdCourses.push(existing);
      } else {
        const course = await prisma.course.create({ data: courseData });
        createdCourses.push(course);
        console.log(`✅ Created Course ${course.course_order}: ${course.title}`);
      }
    }

    // Update course requirements (each course requires the previous one)
    for (let i = 1; i < createdCourses.length; i++) {
      await prisma.course.update({
        where: { id: createdCourses[i].id },
        data: { requires_course: createdCourses[i - 1].id },
      });
    }
    console.log('✓ Updated course prerequisites');

    // Update Course 4 to require Course 3
    const course4 = await prisma.course.findFirst({
      where: {
        game_id: kpopGame.id,
        course_order: 4
      }
    });

    if (course4) {
      await prisma.course.update({
        where: { id: course4.id },
        data: { requires_course: createdCourses[2].id }, // Requires Course 3
      });
      console.log('✓ Updated Course 4 to require Course 3');
    }

    // Show final structure
    const allCourses = await prisma.course.findMany({
      where: { game_id: kpopGame.id },
      orderBy: { course_order: 'asc' }
    });

    console.log('\n📋 Final Course Structure:');
    for (const course of allCourses) {
      const prereq = course.requires_course
        ? allCourses.find(c => c.id === course.requires_course)?.title
        : 'None';
      console.log(`   ${course.course_order}. ${course.title}`);
      console.log(`      Prerequisite: ${prereq}`);
      console.log(`      Badge: ${course.badge_icon} ${course.badge_name}`);
      console.log();
    }

    console.log('🎉 Courses 1-3 added successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

addCourses123();
