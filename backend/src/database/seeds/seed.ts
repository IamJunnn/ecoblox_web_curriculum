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
      title: 'Install Roblox Studio',
      description: 'Download and install Roblox Studio on your computer',
      total_levels: 1,
      display_order: 1,
      url: '/courses/1',
    },
    {
      title: 'Create a Roblox Account',
      description: 'Set up your Roblox account to start creating',
      total_levels: 1,
      display_order: 2,
      url: '/courses/2',
    },
    {
      title: 'Studio Basics',
      description: 'Learn the Roblox Studio interface and essential tools',
      total_levels: 6,
      display_order: 3,
      url: '/courses/3',
    },
  ];

  for (const courseData of courses) {
    const course = courseRepository.create(courseData);
    await courseRepository.save(course);
    console.log(`✅ Created course: ${course.title}`);
  }

  // Create users (Teacher and Admin only - students should be created by teachers/admins)
  const users = [
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
      password_hash: userData.password ? await bcrypt.hash(userData.password, 10) : undefined,
    });

    await studentRepository.save(student);
    console.log(`✅ Created ${userData.role}: ${student.name}`);
  }

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('-------------------');
  console.log('Teacher:');
  console.log('  teacher@robloxacademy.com / password123');
  console.log('\nAdmin:');
  console.log('  admin@robloxacademy.com / password123');
  console.log('\n💡 Note: Students should be created by teachers or admins through the portal.');

  await app.close();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});