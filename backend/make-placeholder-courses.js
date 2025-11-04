const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makePlaceholderCourses() {
  console.log('🔄 Converting courses 5-30 to placeholder courses...\n');

  // Get all courses 5-30 for K-Pop game
  const courses = await prisma.course.findMany({
    where: {
      game_id: 3,
      course_order: {
        gte: 5,
        lte: 30
      }
    },
    orderBy: { course_order: 'asc' }
  });

  console.log(`Found ${courses.length} courses to update\n`);

  let updatedCount = 0;
  for (const course of courses) {
    try {
      await prisma.course.update({
        where: { id: course.id },
        data: {
          total_steps: 1,
          description: 'Coming soon - Course content will be added later'
        }
      });
      console.log(`✅ ${course.course_order}. ${course.title} - ${course.badge_name} ${course.badge_icon} (1 step)`);
      updatedCount++;
    } catch (error) {
      console.error(`❌ Failed to update course ${course.course_order}: ${error.message}`);
    }
  }

  console.log(`\n✨ Successfully updated ${updatedCount} courses to placeholders!`);

  // Show final summary
  const allCourses = await prisma.course.findMany({
    where: { game_id: 3 },
    orderBy: { course_order: 'asc' }
  });

  console.log('\n📊 Final Course Summary:');
  console.log('\nFull Courses (with content):');
  allCourses.filter(c => c.total_steps > 1).forEach(c => {
    console.log(`  ${c.course_order}. ${c.title} - ${c.total_steps} steps`);
  });

  console.log('\nPlaceholder Courses (1 step):');
  allCourses.filter(c => c.total_steps === 1).forEach(c => {
    console.log(`  ${c.course_order}. ${c.title} - ${c.badge_name} ${c.badge_icon}`);
  });

  console.log(`\n🎉 Total: ${allCourses.length} courses (${allCourses.filter(c => c.total_steps > 1).length} full, ${allCourses.filter(c => c.total_steps === 1).length} placeholders)`);

  await prisma.$disconnect();
}

makePlaceholderCourses()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
