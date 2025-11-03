const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function enrollStudentInGame() {
  try {
    console.log('=== ENROLLING STUDENTS IN GAMES ===\n');

    // Get all students who are not enrolled in any games
    const students = await prisma.user.findMany({
      where: {
        role: 'student',
      },
      include: {
        game_enrollments: true,
      }
    });

    console.log(`Found ${students.length} total students\n`);

    // Get the first game (Roblox Obby Adventure)
    const game = await prisma.game.findFirst({
      where: { id: 1 },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    if (!game) {
      console.error('❌ No game found with ID 1');
      return;
    }

    console.log(`Game to enroll in: "${game.name}" (ID: ${game.id})`);
    console.log(`This game has ${game.courses.length} courses:\n`);
    game.courses.forEach(course => {
      console.log(`  - ${course.title}`);
    });
    console.log('');

    // Get or create a class code for enrollment
    let classCode = await prisma.classCode.findFirst({
      where: { game_id: game.id }
    });

    if (!classCode) {
      // Get the first admin or teacher to use as creator
      const admin = await prisma.user.findFirst({
        where: {
          OR: [
            { role: 'admin' },
            { role: 'teacher' }
          ]
        }
      });

      if (!admin) {
        console.error('❌ No admin or teacher found to create class code');
        return;
      }

      // Create a default class code
      classCode = await prisma.classCode.create({
        data: {
          code: 'DEFAULT2025',
          game_id: game.id,
          teacher_id: admin.id,
          teacher_name: admin.name,
        }
      });
      console.log(`✅ Created new class code: ${classCode.code}\n`);
    } else {
      console.log(`Using existing class code: ${classCode.code}\n`);
    }

    // Enroll each student who isn't already enrolled
    let enrolledCount = 0;
    for (const student of students) {
      const alreadyEnrolled = student.game_enrollments.some(
        enrollment => enrollment.game_id === game.id
      );

      if (alreadyEnrolled) {
        console.log(`⏭️  ${student.name} (ID: ${student.id}) - Already enrolled`);
        continue;
      }

      // Enroll the student
      await prisma.gameEnrollment.create({
        data: {
          user_id: student.id,
          game_id: game.id,
          class_code: classCode.code,
        }
      });

      // Update student's class_codes field
      await prisma.user.update({
        where: { id: student.id },
        data: {
          class_codes: JSON.stringify([classCode.code])
        }
      });

      console.log(`✅ ${student.name} (ID: ${student.id}) - Enrolled in "${game.name}"`);
      enrolledCount++;
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`✅ Successfully enrolled ${enrolledCount} new student(s) in "${game.name}"`);
    console.log(`   They can now see all ${game.courses.length} courses in this game!`);
    console.log(`\n💡 Students should refresh their dashboard to see the courses.`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enrollStudentInGame();
