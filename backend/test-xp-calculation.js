const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testXPCalculation() {
  try {
    // Find Johnny Smith
    const student = await prisma.user.findFirst({
      where: {
        email: 'johnny@student.com',
        role: 'student'
      }
    });

    if (!student) {
      console.log('Student not found');
      return;
    }

    console.log(`\n=== Testing XP Calculation for ${student.name} ===\n`);

    // Get all progress events
    const progressEvents = await prisma.progressEvent.findMany({
      where: { user_id: student.id },
      include: {
        course: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    console.log(`Total progress events: ${progressEvents.length}`);

    // Count step_checked events
    const allStepCheckedEvents = progressEvents.filter(
      (e) => e.event_type === 'step_checked'
    );
    console.log(`\nAll step_checked events: ${allStepCheckedEvents.length}`);

    // Count only checked steps (is_checked !== false)
    const checkedSteps = progressEvents.filter(
      (e) => e.event_type === 'step_checked' && e.is_checked !== false
    );
    console.log(`Checked steps (is_checked !== false): ${checkedSteps.length}`);

    // Count unchecked steps (is_checked === false)
    const uncheckedSteps = progressEvents.filter(
      (e) => e.event_type === 'step_checked' && e.is_checked === false
    );
    console.log(`Unchecked steps (is_checked === false): ${uncheckedSteps.length}`);

    // Calculate XP
    const oldXP = allStepCheckedEvents.length * 10;
    const newXP = checkedSteps.length * 10;

    console.log(`\n--- XP Calculation ---`);
    console.log(`Old method (all events): ${oldXP} XP`);
    console.log(`New method (only checked): ${newXP} XP`);
    console.log(`Difference: ${oldXP - newXP} XP`);

    // Show events by course
    console.log(`\n--- Events by Course ---`);
    const courseGroups = {};
    progressEvents.forEach(event => {
      if (event.event_type === 'step_checked') {
        const courseId = event.course_id;
        const courseName = event.course?.title || `Course ${courseId}`;

        if (!courseGroups[courseId]) {
          courseGroups[courseId] = {
            name: courseName,
            checked: 0,
            unchecked: 0,
            total: 0
          };
        }

        courseGroups[courseId].total++;
        if (event.is_checked !== false) {
          courseGroups[courseId].checked++;
        } else {
          courseGroups[courseId].unchecked++;
        }
      }
    });

    Object.entries(courseGroups).forEach(([courseId, data]) => {
      console.log(`\nCourse ${courseId}: ${data.name}`);
      console.log(`  Total events: ${data.total}`);
      console.log(`  Checked: ${data.checked}`);
      console.log(`  Unchecked: ${data.unchecked}`);
      console.log(`  XP from this course: ${data.checked * 10} XP`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testXPCalculation();
