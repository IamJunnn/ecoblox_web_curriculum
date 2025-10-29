import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from '../../students/entities/student.entity';
import { Course } from '../../courses/entities/course.entity';
import { ProgressEvent } from '../../progress/entities/progress-event.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const studentRepository = app.get<Repository<Student>>(getRepositoryToken(Student));
  const courseRepository = app.get<Repository<Course>>(getRepositoryToken(Course));
  const progressRepository = app.get<Repository<ProgressEvent>>(getRepositoryToken(ProgressEvent));

  console.log('🌱 Starting database seed...');

  // Clear existing data in correct order (handle foreign keys)
  console.log('  Clearing progress events...');
  await progressRepository.createQueryBuilder().delete().execute();
  console.log('  Clearing students...');
  await studentRepository.createQueryBuilder().delete().execute();
  console.log('  Clearing courses...');
  await courseRepository.createQueryBuilder().delete().execute();

  // Create courses
  const courses = [
    {
      title: 'Introduction to Roblox Studio',
      description: 'Learn the basics of Roblox Studio and game development',
      total_levels: 6,
      display_order: 1,
      url: '/courses/intro-to-roblox',
    },
    {
      title: 'Lua Programming Basics',
      description: 'Master the fundamentals of Lua scripting',
      total_levels: 6,
      display_order: 2,
      url: '/courses/lua-basics',
    },
    {
      title: 'Building Your First Game',
      description: 'Create a simple obstacle course game',
      total_levels: 8,
      display_order: 3,
      url: '/courses/first-game',
    },
    {
      title: 'Advanced Scripting',
      description: 'Deep dive into advanced Lua concepts',
      total_levels: 10,
      display_order: 4,
      url: '/courses/advanced-scripting',
    },
  ];

  for (const courseData of courses) {
    const course = courseRepository.create(courseData);
    await courseRepository.save(course);
    console.log(`✅ Created course: ${course.title}`);
  }

  // Create users
  const users = [
    // Students
    {
      email: 'alice@school.com',
      name: 'Alice Student',
      role: 'student',
      classCode: 'CLASS2025',
      pinCode: '1234',
    },
    {
      email: 'bob@school.com',
      name: 'Bob Student',
      role: 'student',
      classCode: 'CLASS2025',
      pinCode: '5678',
    },
    {
      email: 'charlie@school.com',
      name: 'Charlie Student',
      role: 'student',
      classCode: 'CLASS2025',
      pinCode: '9012',
    },
    // Teacher
    {
      email: 'teacher@robloxacademy.com',
      name: 'Ms. Johnson',
      role: 'teacher',
      classCode: 'CLASS2025',
      password: 'password123',
    },
    // Admin
    {
      email: 'admin@robloxacademy.com',
      name: 'Admin User',
      role: 'admin',
      classCode: 'ALL',
      password: 'password123',
    },
  ];

  for (const userData of users) {
    const student = studentRepository.create({
      email: userData.email,
      name: userData.name,
      role: userData.role as any,
      class_code: userData.classCode,
      pin_code: userData.pinCode,
      password_hash: userData.password ? await bcrypt.hash(userData.password, 10) : undefined,
    });

    await studentRepository.save(student);

    if (userData.role === 'student') {
      console.log(`✅ Created student: ${student.name} (PIN: ${userData.pinCode})`);
    } else {
      console.log(`✅ Created ${userData.role}: ${student.name}`);
    }
  }

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('-------------------');
  console.log('Students:');
  console.log('  alice@school.com / PIN: 1234');
  console.log('  bob@school.com / PIN: 5678');
  console.log('  charlie@school.com / PIN: 9012');
  console.log('\nTeacher:');
  console.log('  teacher@robloxacademy.com / password123');
  console.log('\nAdmin:');
  console.log('  admin@robloxacademy.com / password123');

  await app.close();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});