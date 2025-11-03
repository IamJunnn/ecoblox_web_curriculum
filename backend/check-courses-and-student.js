const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('=== CHECKING DATABASE ===\n');

    // 1. Check all courses
    console.log('1. All Courses:');
    const courses = await prisma.course.findMany({
      include: {
        game: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    console.log(`Found ${courses.length} courses:\n`);
    courses.forEach(course => {
      console.log(`  - Course ${course.id}: "${course.title}"`);
      console.log(`    Game: ${course.game.name} (ID: ${course.game_id})`);
      console.log(`    Total Steps: ${course.total_steps}`);
      console.log(`    Total Levels: ${course.total_levels}`);
      console.log('');
    });

    // 2. Check students
    console.log('\n2. All Students:');
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      include: {
        game_enrollments: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: { id: 'desc' },
      take: 5
    });

    console.log(`Found ${students.length} students (showing last 5):\n`);
    students.forEach(student => {
      console.log(`  - Student ID ${student.id}: ${student.name} (${student.email})`);
      console.log(`    PIN: ${student.pin_code}`);
      console.log(`    Game Enrollments: ${student.game_enrollments.length}`);
      if (student.game_enrollments.length > 0) {
        student.game_enrollments.forEach(enrollment => {
          console.log(`      → Enrolled in: ${enrollment.game.name} (Game ID: ${enrollment.game_id})`);
          console.log(`        Class Code: ${enrollment.class_code || 'None'}`);
        });
      } else {
        console.log(`      ⚠️  NOT ENROLLED IN ANY GAMES`);
      }
      console.log('');
    });

    // 3. Check games
    console.log('\n3. All Games:');
    const games = await prisma.game.findMany({
      include: {
        courses: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    console.log(`Found ${games.length} games:\n`);
    games.forEach(game => {
      console.log(`  - Game ${game.id}: "${game.name}"`);
      console.log(`    Courses: ${game.courses.length}`);
      game.courses.forEach(course => {
        console.log(`      → ${course.title} (ID: ${course.id})`);
      });
      console.log('');
    });

    // 4. Recommendation
    console.log('\n=== RECOMMENDATIONS ===\n');

    const unenrolledStudents = students.filter(s => s.game_enrollments.length === 0);
    if (unenrolledStudents.length > 0) {
      console.log('⚠️  ISSUE FOUND:');
      console.log(`   ${unenrolledStudents.length} student(s) are not enrolled in any games.`);
      console.log('   Students need to be enrolled in a game to see courses.\n');
      console.log('   FIX: Enroll students in a game by:');
      console.log('   1. Admin Portal → Manage Students → Edit Student');
      console.log('   2. Assign them a class code (e.g., "CLASS2025")');
      console.log('   3. Or use the script below to auto-enroll all students\n');
    } else {
      console.log('✅ All students are enrolled in at least one game!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
