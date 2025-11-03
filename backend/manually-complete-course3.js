const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./database.db'
    }
  }
});

async function completeCourse3() {
  try {
    const studentId = 24; // JunSeop Son
    const courseId = 3; // Studio Basics

    console.log('Creating course_completed event for Studio Basics...');

    // Create course_completed event
    const event = await prisma.progressEvent.create({
      data: {
        user_id: studentId,
        course_id: courseId,
        event_type: 'course_completed',
        level_number: 6,
        step_number: null,
        data: JSON.stringify({
          all_quizzes_correct: true,
          total_levels: 6,
          completed_at: new Date().toISOString()
        })
      }
    });

    console.log('✓ Course completion event created:', event.id);

    // Check if badge needs to be awarded
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    console.log('Course:', course.title, '- Badge:', course.badge_name);

    // Check if badge already exists
    const existingBadge = await prisma.studentBadge.findUnique({
      where: {
        user_id_course_id: {
          user_id: studentId,
          course_id: courseId
        }
      }
    });

    if (existingBadge) {
      console.log('✓ Badge already exists');
    } else {
      // Create badge
      const badge = await prisma.studentBadge.create({
        data: {
          user_id: studentId,
          course_id: courseId,
          badge_name: course.badge_name,
          game_id: course.game_id
        }
      });
      console.log('✓ Badge created:', badge.badge_name);
    }

    // Check badges count
    const badges = await prisma.studentBadge.findMany({
      where: { user_id: studentId }
    });

    console.log('\nTotal badges:', badges.length);
    badges.forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.badge_name}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeCourse3();
