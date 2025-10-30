import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { EmailService } from '../email/email.service';
import { ProgressEvent } from '../progress/entities/progress-event.entity';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(ProgressEvent)
    private progressEventRepository: Repository<ProgressEvent>,
    private emailService: EmailService,
  ) {}

  /**
   * Create a new teacher account
   * Sends invitation email with token to set password
   */
  async createTeacher(createTeacherDto: CreateTeacherDto) {
    // Check if email already exists
    const existingUser = await this.studentRepository.findOne({
      where: { email: createTeacherDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // Create teacher (unverified, no password yet)
    const teacher = this.studentRepository.create({
      name: createTeacherDto.name,
      email: createTeacherDto.email,
      class_code: createTeacherDto.class_code || this.generateClassCode(),
      role: UserRole.TEACHER,
      is_verified: false,
      invitation_token: invitationToken,
    });

    const savedTeacher = await this.studentRepository.save(teacher);

    // Send invitation email
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/setup-password?token=${invitationToken}`;
    await this.emailService.sendTeacherInvitation(
      savedTeacher.email,
      savedTeacher.name,
      invitationLink,
    );

    return {
      success: true,
      teacher: {
        id: savedTeacher.id,
        name: savedTeacher.name,
        email: savedTeacher.email,
        class_code: savedTeacher.class_code,
        role: savedTeacher.role,
        is_verified: savedTeacher.is_verified,
      },
      invitation_token: invitationToken, // Temporary - remove in production
      invitation_link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/setup-password?token=${invitationToken}`,
    };
  }

  /**
   * Get all teachers
   */
  async getAllTeachers() {
    const teachers = await this.studentRepository.find({
      where: { role: UserRole.TEACHER },
      select: [
        'id',
        'name',
        'email',
        'class_code',
        'is_verified',
        'created_at',
        'last_active',
      ],
      order: { created_at: 'DESC' },
    });

    // Get student count for each teacher
    const teachersWithStudentCount = await Promise.all(
      teachers.map(async (teacher) => {
        const studentCount = teacher.class_code
          ? await this.studentRepository.count({
              where: {
                class_code: teacher.class_code,
                role: UserRole.STUDENT,
              },
            })
          : 0;

        return {
          ...teacher,
          student_count: studentCount,
        };
      }),
    );

    return {
      success: true,
      teachers: teachersWithStudentCount,
      count: teachers.length,
    };
  }

  /**
   * Get teacher by ID with their students
   */
  async getTeacherById(id: number) {
    const teacher = await this.studentRepository.findOne({
      where: { id, role: UserRole.TEACHER },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Get students created by this teacher
    const students = await this.studentRepository.find({
      where: {
        created_by_teacher_id: id,
        role: UserRole.STUDENT,
      },
      select: [
        'id',
        'name',
        'email',
        'class_code',
        'created_at',
        'last_active',
      ],
    });

    return {
      success: true,
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        class_code: teacher.class_code,
        is_verified: teacher.is_verified,
        created_at: teacher.created_at,
        last_active: teacher.last_active,
      },
      students,
      student_count: students.length,
    };
  }

  /**
   * Update teacher information
   */
  async updateTeacher(id: number, updateTeacherDto: UpdateTeacherDto) {
    const teacher = await this.studentRepository.findOne({
      where: { id, role: UserRole.TEACHER },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Check if email is being changed and if it already exists
    if (updateTeacherDto.email && updateTeacherDto.email !== teacher.email) {
      const existingUser = await this.studentRepository.findOne({
        where: { email: updateTeacherDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Update teacher
    Object.assign(teacher, updateTeacherDto);
    const updatedTeacher = await this.studentRepository.save(teacher);

    return {
      success: true,
      teacher: {
        id: updatedTeacher.id,
        name: updatedTeacher.name,
        email: updatedTeacher.email,
        class_code: updatedTeacher.class_code,
      },
    };
  }

  /**
   * Delete teacher
   */
  async deleteTeacher(id: number) {
    const teacher = await this.studentRepository.findOne({
      where: { id, role: UserRole.TEACHER },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Check if teacher has students
    const studentCount = await this.studentRepository.count({
      where: {
        created_by_teacher_id: id,
        role: UserRole.STUDENT,
      },
    });

    if (studentCount > 0) {
      throw new ConflictException(
        `Cannot delete teacher with ${studentCount} active students`,
      );
    }

    // Delete any progress events associated with this teacher ID
    // (in case they were previously a student or have test data)
    await this.progressEventRepository.delete({ student_id: id });

    await this.studentRepository.remove(teacher);

    return {
      success: true,
      message: 'Teacher deleted successfully',
    };
  }

  /**
   * Get system statistics
   */
  async getSystemStats() {
    const [teacherCount, studentCount, adminCount] = await Promise.all([
      this.studentRepository.count({ where: { role: UserRole.TEACHER } }),
      this.studentRepository.count({ where: { role: UserRole.STUDENT } }),
      this.studentRepository.count({ where: { role: UserRole.ADMIN } }),
    ]);

    // Get verified vs unverified teachers
    const verifiedTeachers = await this.studentRepository.count({
      where: { role: UserRole.TEACHER, is_verified: true },
    });

    return {
      success: true,
      stats: {
        total_teachers: teacherCount,
        verified_teachers: verifiedTeachers,
        pending_teachers: teacherCount - verifiedTeachers,
        total_students: studentCount,
        total_admins: adminCount,
      },
    };
  }

  /**
   * Create a new student (Admin version - can assign to any teacher)
   */
  async createStudent(createStudentDto: {
    name: string;
    email: string;
    pin_code?: string;
    teacher_id?: number;
  }) {
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

    // Get teacher if specified
    let classCode = 'UNASSIGNED';
    if (createStudentDto.teacher_id) {
      const teacher = await this.studentRepository.findOne({
        where: { id: createStudentDto.teacher_id, role: UserRole.TEACHER },
      });

      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }

      classCode = teacher.class_code || 'UNASSIGNED';
    }

    // Create student
    const studentData: Partial<Student> = {
      name: createStudentDto.name,
      email: createStudentDto.email,
      pin_code: pinCode,
      class_code: classCode,
      role: UserRole.STUDENT,
      is_verified: true,
    };

    // Only set teacher_id if provided
    if (createStudentDto.teacher_id) {
      studentData.created_by_teacher_id = createStudentDto.teacher_id;
    }

    const student: Student = this.studentRepository.create(studentData);
    const savedStudent: Student = await this.studentRepository.save(student);

    // Send welcome email to the student with their login credentials
    try {
      if (savedStudent.pin_code) {
        await this.emailService.sendStudentWelcome(
          savedStudent.email,
          savedStudent.name,
          savedStudent.pin_code,
        );
      }
    } catch (error) {
      // Log error but don't fail the student creation
      console.error('Failed to send welcome email:', error);
    }

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
   * Get all students
   */
  async getAllStudents() {
    // Get all students with their progress events
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.progressEvents', 'progress')
      .leftJoinAndSelect('progress.course', 'course')
      .where('student.role = :role', { role: UserRole.STUDENT })
      .orderBy('student.created_at', 'DESC')
      .getMany();

    // Get all teachers for mapping
    const teachers = await this.studentRepository.find({
      where: { role: UserRole.TEACHER },
      select: ['id', 'name', 'email', 'class_code'],
    });

    const teacherMap = new Map(teachers.map((t) => [t.id, t]));

    // Calculate stats for each student
    const studentsWithStats = students.map((student) => {
      const progressEvents = student.progressEvents || [];

      // Calculate total XP - XP is calculated based on event types, not stored in data
      // 20 XP per step, 100 XP per correct quiz (matching progress service calculation)
      let totalXP = 0;
      progressEvents.forEach((event) => {
        if (event.event_type === 'step_checked') {
          totalXP += 20;
        } else if (event.event_type === 'quiz_answered') {
          const data = event.data ? JSON.parse(event.data) : {};
          if (data.correct) {
            totalXP += 100;
          }
        }
      });

      // Calculate badges (quest completions)
      const badges = progressEvents.filter(
        (event) => event.event_type === 'quest_completed',
      ).length;

      // Calculate progress based on step_checked events (matching student dashboard logic)
      // Course 1 (Studio Basics): 4 steps per level × 6 levels = 24 total steps
      // Course 4 (Install Roblox Studio): 5 steps total
      const totalSteps = 29; // 24 + 5

      // Count unique steps completed across all courses
      const completedStepsSet = new Set<string>();
      progressEvents
        .filter((event) => event.event_type === 'step_checked')
        .forEach((event) => {
          const data = event.data ? JSON.parse(event.data) : {};
          const stepKey = `${event.course_id}-${event.level}-${data.step}`;
          completedStepsSet.add(stepKey);
        });

      const completedSteps = completedStepsSet.size;

      // Calculate progress percentage based on completed steps
      const progress =
        totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      // Calculate courses completed (a course is complete when all its steps are done)
      const courseStepCounts = new Map<number, Set<string>>();
      progressEvents
        .filter((event) => event.event_type === 'step_checked')
        .forEach((event) => {
          if (!courseStepCounts.has(event.course_id)) {
            courseStepCounts.set(event.course_id, new Set());
          }
          const data = event.data ? JSON.parse(event.data) : {};
          const stepKey = `${event.level}-${data.step}`;
          courseStepCounts.get(event.course_id)!.add(stepKey);
        });

      const courseTotalSteps = new Map([
        [1, 24], // 4 steps × 6 levels
        [4, 5], // 5 steps
      ]);

      let coursesCompleted = 0;
      courseStepCounts.forEach((steps, courseId) => {
        const totalStepsInCourse = courseTotalSteps.get(courseId) || 24;
        if (steps.size >= totalStepsInCourse) {
          coursesCompleted++;
        }
      });

      // Get teacher info
      const teacher = student.created_by_teacher_id
        ? teacherMap.get(student.created_by_teacher_id)
        : null;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        pin_code: student.pin_code,
        class_code: student.class_code,
        created_by_teacher_id: student.created_by_teacher_id,
        teacher_name: teacher ? teacher.name : null,
        progress,
        totalXP,
        badges,
        last_active: student.last_active,
        created_at: student.created_at,
      };
    });

    return {
      success: true,
      students: studentsWithStats,
      count: studentsWithStats.length,
    };
  }

  /**
   * Get student by ID with detailed information
   */
  async getStudentById(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id, role: UserRole.STUDENT },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get teacher information
    let teacher: Student | null = null;
    if (student.created_by_teacher_id) {
      teacher = await this.studentRepository.findOne({
        where: { id: student.created_by_teacher_id, role: UserRole.TEACHER },
        select: ['id', 'name', 'email', 'class_code'],
      });
    }

    // Get progress statistics
    const progressEvents = await this.progressEventRepository.find({
      where: { student_id: id },
      relations: ['course'],
    });

    // Calculate statistics - XP is calculated based on event types, not stored in data
    // 20 XP per step, 100 XP per correct quiz (matching progress service calculation)
    let totalXP = 0;
    progressEvents.forEach((event) => {
      if (event.event_type === 'step_checked') {
        totalXP += 20;
      } else if (event.event_type === 'quiz_answered') {
        const data = event.data ? JSON.parse(event.data) : {};
        if (data.correct) {
          totalXP += 100;
        }
      }
    });

    const badgesEarned = progressEvents.filter(
      (event) => event.event_type === 'quest_completed',
    ).length;

    // Calculate progress based on step_checked events (matching student dashboard logic)
    // Course 1 (Studio Basics): 4 steps per level × 6 levels = 24 total steps
    // Course 4 (Install Roblox Studio): 5 steps total
    const totalSteps = 29; // 24 + 5

    // Count unique steps completed across all courses
    const completedStepsSet = new Set<string>();
    progressEvents
      .filter((event) => event.event_type === 'step_checked')
      .forEach((event) => {
        const data = event.data ? JSON.parse(event.data) : {};
        const stepKey = `${event.course_id}-${event.level}-${data.step}`;
        completedStepsSet.add(stepKey);
      });

    const completedSteps = completedStepsSet.size;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    // Calculate courses completed (a course is complete when all its steps are done)
    const courseStepCounts = new Map<number, Set<string>>();
    progressEvents
      .filter((event) => event.event_type === 'step_checked')
      .forEach((event) => {
        if (!courseStepCounts.has(event.course_id)) {
          courseStepCounts.set(event.course_id, new Set());
        }
        const data = event.data ? JSON.parse(event.data) : {};
        const stepKey = `${event.level}-${data.step}`;
        courseStepCounts.get(event.course_id)!.add(stepKey);
      });

    const courseTotalSteps = new Map([
      [1, 24], // 4 steps × 6 levels
      [4, 5], // 5 steps
    ]);

    let coursesCompleted = 0;
    courseStepCounts.forEach((steps, courseId) => {
      const totalStepsInCourse = courseTotalSteps.get(courseId) || 24;
      if (steps.size >= totalStepsInCourse) {
        coursesCompleted++;
      }
    });

    const totalCourses = 2;

    // Get course-specific progress
    const courseProgressMap = new Map();
    progressEvents.forEach((event) => {
      const courseId = event.course_id;
      if (!courseProgressMap.has(courseId)) {
        courseProgressMap.set(courseId, {
          courseId,
          courseName: event.course?.title || 'Unknown Course',
          completed: false,
          progress: 0,
          xp: 0,
          lastAccessed: event.timestamp,
        });
      }
      const courseData = courseProgressMap.get(courseId);

      // Calculate XP based on event type (matching progress service)
      if (event.event_type === 'step_checked') {
        courseData.xp += 20;
      } else if (event.event_type === 'quiz_answered') {
        const eventData = event.data ? JSON.parse(event.data) : {};
        if (eventData.correct) {
          courseData.xp += 100;
        }
      }

      if (event.timestamp > courseData.lastAccessed) {
        courseData.lastAccessed = event.timestamp;
      }
    });

    // Calculate progress percentage for each course based on step completion
    courseProgressMap.forEach((courseData, courseId) => {
      const stepsInCourse = courseStepCounts.get(courseId);
      const completedStepsInCourse = stepsInCourse ? stepsInCourse.size : 0;
      const totalStepsInCourse = courseTotalSteps.get(courseId) || 24;

      // Progress percentage = (completed steps / total steps) * 100
      courseData.progress = totalStepsInCourse > 0
        ? Math.round((completedStepsInCourse / totalStepsInCourse) * 100)
        : 0;

      // Mark as completed if all steps done
      if (completedStepsInCourse >= totalStepsInCourse) {
        courseData.completed = true;
      }
    });

    return {
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        pin: student.pin_code,
        classCode: student.class_code,
        progress,
        totalXP,
        coursesCompleted,
        totalCourses,
        badgesEarned,
        lastActive: student.last_active,
        createdAt: student.created_at,
        teacher: teacher
          ? {
              id: teacher.id,
              name: teacher.name,
              email: teacher.email,
              classCode: teacher.class_code,
            }
          : null,
      },
      courseProgress: Array.from(courseProgressMap.values()),
    };
  }

  /**
   * Update student information
   */
  async updateStudent(id: number, updateStudentDto: UpdateStudentDto) {
    const student = await this.studentRepository.findOne({
      where: { id, role: UserRole.STUDENT },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if email is being changed and if it already exists
    if (updateStudentDto.email && updateStudentDto.email !== student.email) {
      const existingUser = await this.studentRepository.findOne({
        where: { email: updateStudentDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Update student
    if (updateStudentDto.name) student.name = updateStudentDto.name;
    if (updateStudentDto.email) student.email = updateStudentDto.email;
    if (updateStudentDto.pin_code) student.pin_code = updateStudentDto.pin_code;

    // Update teacher assignment if provided
    if (updateStudentDto.teacher_id !== undefined) {
      if (updateStudentDto.teacher_id === null || updateStudentDto.teacher_id === 0) {
        // Unassign teacher
        student.created_by_teacher_id = undefined;
        student.class_code = 'UNASSIGNED';
      } else {
        // Verify teacher exists and get their class code
        const teacher = await this.studentRepository.findOne({
          where: { id: updateStudentDto.teacher_id, role: UserRole.TEACHER },
        });

        if (!teacher) {
          throw new NotFoundException('Teacher not found');
        }

        student.created_by_teacher_id = updateStudentDto.teacher_id;
        student.class_code = teacher.class_code || 'UNASSIGNED';
      }
    }

    const updatedStudent = await this.studentRepository.save(student);

    return {
      success: true,
      student: {
        id: updatedStudent.id,
        name: updatedStudent.name,
        email: updatedStudent.email,
        pin: updatedStudent.pin_code,
      },
    };
  }

  /**
   * Generate new PIN for student
   */
  async generateNewPin(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id, role: UserRole.STUDENT },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Generate a random 4-digit PIN
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    student.pin_code = newPin;

    await this.studentRepository.save(student);

    return {
      success: true,
      pin: newPin,
      message: 'New PIN generated successfully',
    };
  }

  /**
   * Reset student progress
   */
  async resetStudentProgress(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id, role: UserRole.STUDENT },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Delete all progress events for this student
    await this.progressEventRepository.delete({ student_id: id });

    return {
      success: true,
      message: 'Student progress reset successfully',
    };
  }

  /**
   * Delete student
   */
  async deleteStudent(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id, role: UserRole.STUDENT },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Delete all progress events first (cascade delete)
    await this.progressEventRepository.delete({ student_id: id });

    // Delete the student
    await this.studentRepository.remove(student);

    return {
      success: true,
      message: 'Student deleted successfully',
    };
  }

  /**
   * Generate a unique class code
   */
  private generateClassCode(): string {
    const year = new Date().getFullYear();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CLASS${year}_${randomSuffix}`;
  }

  /**
   * Generate a unique 4-digit PIN for a student
   */
  private async generateUniquePin(): Promise<string> {
    let pin = '';
    let isUnique = false;

    while (!isUnique) {
      // Generate a random 4-digit PIN
      pin = Math.floor(1000 + Math.random() * 9000).toString();

      // Check if this PIN already exists
      const existingPin = await this.studentRepository.findOne({
        where: { pin_code: pin },
      });

      if (!existingPin) {
        isUnique = true;
      }
    }

    return pin;
  }
}
