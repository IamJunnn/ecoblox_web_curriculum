import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { getRepository } from 'typeorm'
import { Student } from '../students/entities/student.entity'
import { Course } from '../courses/entities/course.entity'
import { UserRole } from '../common/enums/user-role.enum'
import * as bcrypt from 'bcrypt'

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule)

  const studentRepo = app.get('StudentRepository')
  const courseRepo = app.get('CourseRepository')

  console.log('🌱 Starting database seed...')

  // Hash password for teachers/admins
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create test users
  const users = [
    // Students with PINs
    {
      name: 'Alice Student',
      email: 'alice@school.com',
      pin_code: '1234',
      role: UserRole.STUDENT,
      class_code: 'CLASS2025',
    },
    {
      name: 'Bob Student',
      email: 'bob@school.com',
      pin_code: '5678',
      role: UserRole.STUDENT,
      class_code: 'CLASS2025',
    },
    {
      name: 'Carol Student',
      email: 'carol@school.com',
      pin_code: '9012',
      role: UserRole.STUDENT,
      class_code: 'CLASS2025',
    },
    // Teacher with password
    {
      name: 'Teacher Smith',
      email: 'teacher@robloxacademy.com',
      password_hash: hashedPassword,
      role: UserRole.TEACHER,
      class_code: 'CLASS2025',
    },
    // Admin with password
    {
      name: 'Admin User',
      email: 'admin@robloxacademy.com',
      password_hash: hashedPassword,
      role: UserRole.ADMIN,
      class_code: 'SYSTEM',
    },
  ]

  // Create courses
  const courses = [
    {
      title: 'Studio Basics',
      description: 'Learn the fundamentals of Roblox Studio',
      total_levels: 6,
      url: '/courses/studio-basics',
      display_order: 1,
    },
    {
      title: 'Intermediate Building',
      description: 'Advanced building techniques and tools',
      total_levels: 8,
      url: '/courses/intermediate-building',
      display_order: 2,
    },
    {
      title: 'Advanced Scripting',
      description: 'Master Lua scripting for game mechanics',
      total_levels: 10,
      url: '/courses/advanced-scripting',
      display_order: 3,
    },
    {
      title: 'Install Roblox Studio',
      description: 'Get started by installing Roblox Studio',
      total_levels: 1,
      url: '/courses/install-roblox-studio',
      display_order: 0,
    },
  ]

  console.log('📚 Creating courses...')
  for (const course of courses) {
    await courseRepo.save(course)
  }

  console.log('👥 Creating users...')
  for (const user of users) {
    await studentRepo.save(user)
  }

  console.log('✅ Database seeded successfully!')
  console.log('\n📝 Test Credentials:')
  console.log('-------------------')
  console.log('Students (use PIN):')
  console.log('  - alice@school.com / PIN: 1234')
  console.log('  - bob@school.com / PIN: 5678')
  console.log('  - carol@school.com / PIN: 9012')
  console.log('\nTeacher:')
  console.log('  - teacher@robloxacademy.com / password123')
  console.log('\nAdmin:')
  console.log('  - admin@robloxacademy.com / password123')

  await app.close()
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})