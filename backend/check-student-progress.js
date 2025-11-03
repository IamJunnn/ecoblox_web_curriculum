const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStudentProgress() {
  try {
    const student = await prisma.user.findFirst({
      where: { email: 'junson@launchwith.co' },
      include: {
        game_enrollments: {
          include: {
            game: {
              include: {
                courses: {
                  select: {
                    id: true,
                    title: true,
                    total_steps: true,
                  },
                },
              },
            },
          },
        },
        progress_events: {
          select: {
            course_id: true,
            event_type: true,
            step_number: true,
          },
        },
      },
    });

    console.log('=== Student:', student.name, '===\n');

    // Get all enrolled courses
    const enrolledCourses = [];
    student.game_enrollments.forEach((enrollment) => {
      enrollment.game.courses.forEach((course) => {
        enrolledCourses.push(course);
      });
    });

    console.log('Enrolled Courses:');
    enrolledCourses.forEach((c) => {
      console.log(`  - Course ${c.id}: ${c.title} (${c.total_steps} steps)`);
    });

    // Count steps completed per course
    const stepsByCourse = new Map();
    student.progress_events.forEach((event) => {
      if (event.event_type === 'step_checked') {
        stepsByCourse.set(event.course_id, (stepsByCourse.get(event.course_id) || 0) + 1);
      }
    });

    console.log('\nSteps Completed by Course:');
    for (const [courseId, count] of stepsByCourse) {
      const course = enrolledCourses.find((c) => c.id === courseId);
      if (course) {
        const percentage = Math.round((count / course.total_steps) * 100);
        console.log(`  - Course ${courseId}: ${count}/${course.total_steps} steps (${percentage}%)`);
      }
    }

    // Calculate overall progress (average across all enrolled courses)
    let totalPercentage = 0;
    let courseCount = 0;
    for (const course of enrolledCourses) {
      const completed = stepsByCourse.get(course.id) || 0;
      const percentage = Math.round((completed / course.total_steps) * 100);
      totalPercentage += percentage;
      courseCount++;
    }
    const overallProgress = courseCount > 0 ? Math.round(totalPercentage / courseCount) : 0;

    console.log('\n=== Overall Progress (Average Method): ' + overallProgress + '% ===');

    // Calculate admin method (total steps)
    let totalStepsCompleted = 0;
    let totalStepsPossible = 0;
    const coursesWithProgress = new Set();

    student.progress_events.forEach((event) => {
      coursesWithProgress.add(event.course_id);
      if (event.event_type === 'step_checked') {
        totalStepsCompleted++;
      }
    });

    for (const courseId of coursesWithProgress) {
      const course = enrolledCourses.find((c) => c.id === courseId);
      if (course) {
        totalStepsPossible += course.total_steps;
      }
    }

    const adminProgress = totalStepsPossible > 0 ? Math.round((totalStepsCompleted / totalStepsPossible) * 100) : 0;
    console.log('=== Overall Progress (Admin Method - OLD): ' + adminProgress + '% ===\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkStudentProgress();
