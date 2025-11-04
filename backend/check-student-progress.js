const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStudentProgress() {
  try {
    const student = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'junson@launchwith.co' },
          { name: { contains: 'Johnny' } }
        ]
      },
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

    // Check Course 3 specific details
    console.log('=== COURSE 3 (Studio Basics) DETAILS ===');
    const course3Events = await prisma.progressEvent.findMany({
      where: {
        user_id: student.id,
        course_id: 10 // Course 3 ID
      },
      orderBy: { timestamp: 'desc' }
    });

    const eventTypes = {};
    course3Events.forEach(e => {
      eventTypes[e.event_type] = (eventTypes[e.event_type] || 0) + 1;
    });

    for (const [type, count] of Object.entries(eventTypes)) {
      console.log(`  ${type}: ${count}`);
    }

    // Check for course_completed event
    const completionEvent = course3Events.find(e => e.event_type === 'course_completed');
    console.log(`\nCourse 3 completed? ${completionEvent ? 'YES' : 'NO'}`);
    if (completionEvent) {
      console.log(`  Completed at: ${completionEvent.timestamp.toISOString()}`);
      console.log(`  Data: ${completionEvent.data}`);
    }

    // Check badges
    console.log('\n=== BADGES ===');
    const badges = await prisma.studentBadge.findMany({
      where: { user_id: student.id },
      include: { course: true }
    });

    if (badges.length === 0) {
      console.log('No badges earned');
    } else {
      badges.forEach(b => {
        console.log(`  ✓ ${b.badge_name} (${b.course.title})`);
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkStudentProgress();
