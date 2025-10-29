import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  /**
   * Create a new student account by a teacher
   * Generates PIN automatically if not provided
   */
  async createStudent(teacherId: number, createStudentDto: CreateStudentDto) {
    // Get teacher to verify they exist and get their class_code
    const teacher = await this.studentRepository.findOne({
      where: { id: teacherId, role: UserRole.TEACHER },
    });

    if (!teacher) {
      throw new UnauthorizedException('Teacher not found');
    }

    // Check if email already exists
    const existingUser = await this.studentRepository.findOne({
      where: { email: createStudentDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Generate PIN if not provided
    let pinCode = createStudentDto.pin_code;
    if (!pinCode) {
      pinCode = await this.generateUniquePin();
    } else {
      // Check if provided PIN already exists
      const existingPin = await this.studentRepository.findOne({
        where: { pin_code: pinCode },
      });
      if (existingPin) {
        throw new ConflictException('PIN code already exists');
      }
    }

    // Create student
    const student = this.studentRepository.create({
      name: createStudentDto.name,
      email: createStudentDto.email,
      pin_code: pinCode,
      class_code: teacher.class_code, // Use teacher's class_code
      created_by_teacher_id: teacherId,
      role: UserRole.STUDENT,
      is_verified: true, // Students are auto-verified
    });

    const savedStudent = await this.studentRepository.save(student);

    return {
      success: true,
      student: {
        id: savedStudent.id,
        name: savedStudent.name,
        email: savedStudent.email,
        pin: savedStudent.pin_code,
        classCode: savedStudent.class_code,
        createdAt: savedStudent.created_at,
      },
    };
  }

  /**
   * Get all students for a teacher with their progress stats
   */
  async getTeacherStudents(teacherId: number) {
    // Get teacher to verify and get class_code
    const teacher = await this.studentRepository.findOne({
      where: { id: teacherId, role: UserRole.TEACHER },
    });

    if (!teacher) {
      throw new UnauthorizedException('Teacher not found');
    }

    // Get all students in this teacher's class
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.progressEvents', 'progress')
      .leftJoinAndSelect('progress.course', 'course')
      .where('student.class_code = :classCode', {
        classCode: teacher.class_code,
      })
      .andWhere('student.role = :role', { role: UserRole.STUDENT })
      .orderBy('student.created_at', 'DESC')
      .getMany();

    // Calculate stats for each student
    const studentsWithStats = students.map((student) => {
      const progressEvents = student.progressEvents || [];

      // Calculate total XP
      const totalXP = progressEvents.reduce((sum, event) => {
        const data = event.data ? JSON.parse(event.data) : {};
        return sum + (data.xp || 0);
      }, 0);

      // Calculate badges (quest completions)
      const badges = progressEvents.filter(
        (event) => event.event_type === 'quest_completed',
      ).length;

      // Calculate courses completed
      const coursesCompleted = new Set(
        progressEvents
          .filter((event) => event.event_type === 'course_completed')
          .map((event) => event.course_id),
      ).size;

      // Calculate progress percentage (assuming 8 total courses)
      const totalCourses = 8;
      const progress =
        totalCourses > 0 ? Math.round((coursesCompleted / totalCourses) * 100) : 0;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        classCode: student.class_code,
        progress,
        totalXP,
        badges,
        lastActive: student.last_active,
      };
    });

    return {
      success: true,
      students: studentsWithStats,
    };
  }

  /**
   * Get teacher dashboard statistics
   */
  async getTeacherStats(teacherId: number) {
    // Get teacher to verify and get class_code
    const teacher = await this.studentRepository.findOne({
      where: { id: teacherId, role: UserRole.TEACHER },
    });

    if (!teacher) {
      throw new UnauthorizedException('Teacher not found');
    }

    // Get all students in this teacher's class
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.progressEvents', 'progress')
      .where('student.class_code = :classCode', {
        classCode: teacher.class_code,
      })
      .andWhere('student.role = :role', { role: UserRole.STUDENT })
      .getMany();

    const totalStudents = students.length;

    // Calculate active today (students with last_active today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = students.filter((student) => {
      const lastActive = new Date(student.last_active);
      lastActive.setHours(0, 0, 0, 0);
      return lastActive.getTime() === today.getTime();
    }).length;

    // Calculate average progress and total XP
    let totalProgress = 0;
    let totalXP = 0;
    const totalCourses = 8;

    students.forEach((student) => {
      const progressEvents = student.progressEvents || [];

      // Calculate XP
      const studentXP = progressEvents.reduce((sum, event) => {
        const data = event.data ? JSON.parse(event.data) : {};
        return sum + (data.xp || 0);
      }, 0);
      totalXP += studentXP;

      // Calculate courses completed
      const coursesCompleted = new Set(
        progressEvents
          .filter((event) => event.event_type === 'course_completed')
          .map((event) => event.course_id),
      ).size;

      // Calculate progress percentage
      const progress =
        totalCourses > 0 ? (coursesCompleted / totalCourses) * 100 : 0;
      totalProgress += progress;
    });

    const avgProgress =
      totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;

    return {
      success: true,
      stats: {
        totalStudents,
        activeToday,
        avgProgress,
        totalXP,
      },
    };
  }

  /**
   * Generate a unique 4-digit PIN
   */
  private async generateUniquePin(): Promise<string> {
    let pin = '';
    let isUnique = false;

    while (!isUnique) {
      // Generate random 4-digit PIN
      pin = Math.floor(1000 + Math.random() * 9000).toString();

      // Check if it already exists
      const existing = await this.studentRepository.findOne({
        where: { pin_code: pin },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    return pin;
  }
}
