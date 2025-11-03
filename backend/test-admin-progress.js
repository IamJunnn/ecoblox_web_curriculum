const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAdminProgress() {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      select: {
        id: true,
        name: true,
        email: true,
        progress_events: {
          select: {
            course_id: true,
            event_type: true,
          },
        },
        game_enrollments: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Get all courses
    const allCourses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        total_steps: true,
        game_id: true,
      },
    });

    for (const student of students) {
      console.log('=== Student:', student.name, '===');

      // Get all enrolled courses from game enrollments
      const enrolledCourses = new Set();
      for (const enrollment of student.game_enrollments) {
        const gameCourses = allCourses.filter(c => c.game_id === enrollment.game.id);
        gameCourses.forEach(c => enrolledCourses.add(c.id));
      }

      console.log('Enrolled in', enrolledCourses.size, 'courses');

      // Count steps completed per course
      const stepsByCourse = new Map();
      let totalStepsCompleted = 0;

      for (const event of student.progress_events) {
        if (event.event_type === 'step_checked') {
          stepsByCourse.set(event.course_id, (stepsByCourse.get(event.course_id) || 0) + 1);
          totalStepsCompleted++;
        }
      }

      // Calculate progress as average percentage across all enrolled courses
      let totalPercentage = 0;
      let courseCount = 0;

      for (const courseId of enrolledCourses) {
        const course = allCourses.find(c => c.id === courseId);
        if (course && course.total_steps > 0) {
          const completed = stepsByCourse.get(courseId) || 0;
          const percentage = Math.round((completed / course.total_steps) * 100);
          totalPercentage += percentage;
          courseCount++;
          console.log(`  Course ${courseId} (${course.title}): ${completed}/${course.total_steps} = ${percentage}%`);
        }
      }

      const progress = courseCount > 0 ? Math.round(totalPercentage / courseCount) : 0;
      console.log('Overall Progress:', progress + '%');
      console.log('Total XP:', totalStepsCompleted * 10);
      console.log('');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testAdminProgress();
