import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process for new schema...');

  // Check if we already have data
  const existingUsers = await prisma.user.count();

  if (existingUsers > 0) {
    console.log(`✅ Database already has ${existingUsers} users. Skipping seed to preserve existing data.`);
    return;
  }

  console.log('📝 Database is empty. Creating games, courses, and sample accounts...');

  // ============ Create Games ============
  const game1 = await prisma.game.create({
    data: {
      name: 'Roblox Obby Adventure',
      description: 'Create your first obstacle course game in Roblox',
      display_order: 1,
      is_active: true,
    },
  });
  console.log('✅ Created Game 1:', game1.name);

  const game2 = await prisma.game.create({
    data: {
      name: 'Roblox Tycoon Game',
      description: 'Build an amazing tycoon game with economy system',
      display_order: 2,
      is_active: true,
    },
  });
  console.log('✅ Created Game 2:', game2.name);

  // ============ Create Courses for Game 1 ============
  const game1Courses = [
    {
      game_id: game1.id,
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
      game_id: game1.id,
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
      game_id: game1.id,
      course_order: 3,
      title: 'Studio Basics',
      description: 'Learn the Roblox Studio interface and basic tools',
      total_steps: 24, // 6 levels × 4 steps per level = 24 total steps
      badge_name: 'Explorer Badge',
      badge_icon: '🔍',
      badge_message: 'You know your way around Roblox Studio!',
      requires_course: null,
      display_order: 3,
    },
    {
      game_id: game1.id,
      course_order: 4,
      title: 'Build Your First Obby',
      description: 'Create obstacles and challenges for players',
      total_steps: 10,
      badge_name: 'Builder Badge',
      badge_icon: '🏗️',
      badge_message: 'Amazing! You built your first obstacle course!',
      requires_course: null,
      display_order: 4,
    },
  ];

  const createdCourses: any[] = [];
  for (const courseData of game1Courses) {
    const course = await prisma.course.create({ data: courseData });
    createdCourses.push(course);
    console.log(`✅ Created course: ${course.title} (${course.total_steps} steps)`);
  }

  // Update course requirements (each course requires the previous one)
  for (let i = 1; i < createdCourses.length; i++) {
    await prisma.course.update({
      where: { id: createdCourses[i].id },
      data: { requires_course: createdCourses[i - 1].id },
    });
  }

  // ============ Create sample courses for Game 2 ============
  const game2Courses = [
    {
      game_id: game2.id,
      course_order: 1,
      title: 'Tycoon Basics',
      description: 'Understanding tycoon game mechanics',
      total_steps: 6,
      badge_name: 'Tycoon Starter',
      badge_icon: '💰',
      badge_message: 'Welcome to the world of tycoons!',
      requires_course: null,
      display_order: 1,
    },
    {
      game_id: game2.id,
      course_order: 2,
      title: 'Money System',
      description: 'Create currency and economy',
      total_steps: 8,
      badge_name: 'Economy Master',
      badge_icon: '💎',
      badge_message: 'You understand game economics!',
      requires_course: null,
      display_order: 2,
    },
  ];

  for (const courseData of game2Courses) {
    const course = await prisma.course.create({ data: courseData });
    console.log(`✅ Created course: ${course.title} (${course.total_steps} steps)`);
  }

  // ============ Create default Admin account ============
  const adminPassword = await bcrypt.hash('o}`ZN4A%Qd3>5j', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@ecoblox.build',
      password_hash: adminPassword,
      role: 'admin',
      is_verified: true,
    },
  });
  console.log('✅ Created admin account:', admin.email);

  // ============ Create sample Teacher accounts ============
  const teacherPassword = await bcrypt.hash('teacher123', 10);

  const teacher1 = await prisma.user.create({
    data: {
      name: 'Benjamin Smith',
      email: 'benjamin@school.edu',
      password_hash: teacherPassword,
      role: 'teacher',
      is_verified: true,
    },
  });
  console.log('✅ Created teacher account:', teacher1.email);

  const teacher2 = await prisma.user.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah@school.edu',
      password_hash: teacherPassword,
      role: 'teacher',
      is_verified: true,
    },
  });
  console.log('✅ Created teacher account:', teacher2.email);

  // ============ Create Class Codes for Teachers ============
  const benClass1 = await prisma.classCode.create({
    data: {
      code: 'BENGAME1-ABC3',
      teacher_id: teacher1.id,
      teacher_name: 'Benjamin',
      game_id: game1.id,
      is_active: true,
    },
  });
  console.log('✅ Created class code:', benClass1.code);

  const sarahClass1 = await prisma.classCode.create({
    data: {
      code: 'SARGAME1-XY4Z',
      teacher_id: teacher2.id,
      teacher_name: 'Sarah',
      game_id: game1.id,
      is_active: true,
    },
  });
  console.log('✅ Created class code:', sarahClass1.code);

  // ============ Create sample Students with parent emails ============
  const studentPassword = await bcrypt.hash('student123', 10);
  const students = [
    {
      name: 'Johnny Smith',
      email: 'johnny@student.com',
      parent_email: 'parent.smith@gmail.com',
      parent_name: 'Mr. Smith',
      pin_code: '1234',
      teacher_id: teacher1.id,
      class_code: benClass1.code,
    },
    {
      name: 'Emma Wilson',
      email: 'emma@student.com',
      parent_email: 'wilson.family@gmail.com',
      parent_name: 'Mrs. Wilson',
      pin_code: '5678',
      teacher_id: teacher1.id,
      class_code: benClass1.code,
    },
    {
      name: 'Michael Brown',
      email: 'michael@student.com',
      parent_email: 'brown.parents@gmail.com',
      parent_name: 'Mr. Brown',
      pin_code: '9012',
      teacher_id: teacher2.id,
      class_code: sarahClass1.code,
    },
  ];

  for (const studentData of students) {
    const student = await prisma.user.create({
      data: {
        name: studentData.name,
        email: studentData.email,
        password_hash: studentPassword,
        pin_code: studentData.pin_code,
        parent_email: studentData.parent_email,
        parent_name: studentData.parent_name,
        role: 'student',
        created_by_teacher_id: studentData.teacher_id,
        class_codes: JSON.stringify([studentData.class_code]),
        is_verified: true,
      },
    });

    // Enroll student in Game 1
    await prisma.gameEnrollment.create({
      data: {
        user_id: student.id,
        game_id: game1.id,
        class_code: studentData.class_code,
        unlocked_by: studentData.teacher_id,
        is_active: true,
      },
    });

    console.log(`✅ Created student: ${student.name} (PIN: ${studentData.pin_code}, Parent: ${studentData.parent_email})`);
  }

  // Update class code student counts
  await prisma.classCode.update({
    where: { id: benClass1.id },
    data: { student_count: 2 },
  });

  await prisma.classCode.update({
    where: { id: sarahClass1.id },
    data: { student_count: 1 },
  });

  console.log('\n📊 Seed Summary:');
  console.log('- 2 Games created');
  console.log('- 6 Courses created (4 for Game 1, 2 for Game 2)');
  console.log('- 1 Admin account');
  console.log('- 2 Teacher accounts');
  console.log('- 3 Student accounts with parent emails');
  console.log('- 2 Class codes generated');

  console.log('\n🔐 Login Credentials:');
  console.log('Admin: admin@ecoblox.build / o}`ZN4A%Qd3>5j');
  console.log('Teacher 1: benjamin@school.edu / teacher123');
  console.log('Teacher 2: sarah@school.edu / teacher123');
  console.log('Students: Use PIN codes (1234, 5678, 9012) or student123');

  console.log('\n🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });