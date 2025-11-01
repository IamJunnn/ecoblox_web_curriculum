import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a unique class code for a teacher and game
   */
  async generateClassCode(teacherId: number, teacherName: string, gameId: number): Promise<string> {
    const prefix = teacherName.substring(0, 3).toUpperCase();
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      code = `${prefix}GAME${gameId}-${random}`;

      const existing = await this.prisma.classCode.findUnique({
        where: { code }
      });

      if (!existing) {
        isUnique = true;
      }
    }

    // Create the class code
    await this.prisma.classCode.create({
      data: {
        code: code!,
        teacher_id: teacherId,
        teacher_name: teacherName,
        game_id: gameId,
        is_active: true
      }
    });

    return code!;
  }

  /**
   * Create a new student account
   */
  async createStudent(teacherId: number, studentData: {
    name: string;
    email: string;
    parentEmail: string;
    parentName?: string;
    usePin?: boolean;
    classCode: string;
  }) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: studentData.email }
    });

    if (existingUser) {
      throw new BadRequestException('A user with this email already exists');
    }

    // Validate class code exists and belongs to this teacher
    const classCode = await this.prisma.classCode.findUnique({
      where: { code: studentData.classCode }
    });

    if (!classCode) {
      throw new NotFoundException('Class code not found');
    }

    if (classCode.teacher_id !== teacherId) {
      throw new BadRequestException('This class code does not belong to you');
    }

    // Generate PIN or password
    let pinCode: string | null = null;
    let passwordHash: string | null = null;

    if (studentData.usePin) {
      pinCode = Math.floor(1000 + Math.random() * 9000).toString();
    } else {
      const tempPassword = this.generateTempPassword();
      passwordHash = await bcrypt.hash(tempPassword, 10);
    }

    // Create student account
    const student = await this.prisma.user.create({
      data: {
        name: studentData.name,
        email: studentData.email,
        parent_email: studentData.parentEmail,
        parent_name: studentData.parentName,
        role: 'student',
        pin_code: pinCode,
        password_hash: passwordHash,
        created_by_teacher_id: teacherId,
        class_codes: JSON.stringify([studentData.classCode]),
        is_verified: false
      }
    });

    // Enroll student in the game
    await this.prisma.gameEnrollment.create({
      data: {
        user_id: student.id,
        game_id: classCode.game_id,
        class_code: studentData.classCode,
        unlocked_by: teacherId,
        is_active: true
      }
    });

    // Update class code student count
    await this.prisma.classCode.update({
      where: { id: classCode.id },
      data: { student_count: { increment: 1 } }
    });

    // TODO: Send welcome email to parent
    // await this.emailService.sendWelcomeEmail(student, pinCode);

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      pinCode: pinCode,
      classCode: studentData.classCode
    };
  }

  /**
   * Get all students for a teacher
   */
  async getMyStudents(teacherId: number) {
    const students = await this.prisma.user.findMany({
      where: {
        created_by_teacher_id: teacherId,
        role: 'student'
      },
      select: {
        id: true,
        name: true,
        email: true,
        parent_email: true,
        class_codes: true,
        created_at: true,
        last_active: true,
        is_verified: true,
        progress_events: {
          select: {
            course_id: true,
            event_type: true,
            step_number: true,
            timestamp: true
          }
        },
        badges: {
          select: {
            badge_name: true,
            earned_at: true,
            game_id: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Parse class codes and calculate progress
    return students.map(student => {
      const classCodes = student.class_codes ? JSON.parse(student.class_codes) : [];

      // Calculate progress stats
      const completedSteps = student.progress_events.filter(e => e.event_type === 'step_completed').length;
      const completedCourses = student.progress_events.filter(e => e.event_type === 'course_completed').length;
      const totalBadges = student.badges.length;

      return {
        ...student,
        class_codes: classCodes,
        stats: {
          completedSteps,
          completedCourses,
          totalBadges
        }
      };
    });
  }

  /**
   * Get a specific student's detailed progress
   */
  async getStudentProgress(teacherId: number, studentId: number) {
    const student = await this.prisma.user.findFirst({
      where: {
        id: studentId,
        created_by_teacher_id: teacherId,
        role: 'student'
      },
      include: {
        progress_events: {
          include: {
            course: true
          },
          orderBy: { timestamp: 'desc' }
        },
        badges: true,
        game_enrollments: {
          include: {
            game: true
          }
        }
      }
    });

    if (!student) {
      throw new NotFoundException('Student not found or does not belong to you');
    }

    // Calculate progress for each enrolled game
    const gameProgress = await Promise.all(
      student.game_enrollments.map(async (enrollment) => {
        const courses = await this.prisma.course.findMany({
          where: { game_id: enrollment.game_id }
        });

        const courseProgress = courses.map(course => {
          const steps = student.progress_events.filter(
            e => e.course_id === course.id && e.event_type === 'step_completed'
          );
          const isCompleted = student.progress_events.some(
            e => e.course_id === course.id && e.event_type === 'course_completed'
          );
          const hasBadge = student.badges.some(b => b.course_id === course.id);

          return {
            courseId: course.id,
            title: course.title,
            totalSteps: course.total_steps,
            completedSteps: steps.length,
            isCompleted,
            hasBadge,
            badgeName: course.badge_name
          };
        });

        return {
          gameId: enrollment.game_id,
          gameName: enrollment.game.name,
          enrolledAt: enrollment.enrolled_at,
          courseProgress
        };
      })
    );

    return {
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        parentEmail: student.parent_email
      },
      gameProgress,
      totalBadges: student.badges.length,
      recentActivity: student.progress_events.slice(0, 10)
    };
  }

  /**
   * Get all class codes for a teacher
   */
  async getMyClassCodes(teacherId: number) {
    return this.prisma.classCode.findMany({
      where: { teacher_id: teacherId },
      include: {
        game: true
      },
      orderBy: { created_at: 'desc' }
    });
  }

  /**
   * Unlock a new game for a student
   */
  async unlockGameForStudent(teacherId: number, studentId: number, gameId: number, classCode: string) {
    // Verify student belongs to teacher
    const student = await this.prisma.user.findFirst({
      where: {
        id: studentId,
        created_by_teacher_id: teacherId,
        role: 'student'
      }
    });

    if (!student) {
      throw new NotFoundException('Student not found or does not belong to you');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.gameEnrollment.findUnique({
      where: {
        user_id_game_id: {
          user_id: studentId,
          game_id: gameId
        }
      }
    });

    if (existingEnrollment) {
      throw new BadRequestException('Student is already enrolled in this game');
    }

    // Enroll student
    await this.prisma.gameEnrollment.create({
      data: {
        user_id: studentId,
        game_id: gameId,
        class_code: classCode,
        unlocked_by: teacherId,
        is_active: true
      }
    });

    // Update student's class codes
    const currentCodes = student.class_codes ? JSON.parse(student.class_codes) : [];
    if (!currentCodes.includes(classCode)) {
      currentCodes.push(classCode);
      await this.prisma.user.update({
        where: { id: studentId },
        data: { class_codes: JSON.stringify(currentCodes) }
      });
    }

    return { success: true, message: `Game ${gameId} unlocked for student` };
  }

  /**
   * Generate temporary password
   */
  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Get teacher dashboard stats
   */
  async getDashboardStats(teacherId: number) {
    const students = await this.prisma.user.count({
      where: {
        created_by_teacher_id: teacherId,
        role: 'student'
      }
    });

    const classCodes = await this.prisma.classCode.count({
      where: { teacher_id: teacherId }
    });

    const recentBadges = await this.prisma.studentBadge.findMany({
      where: {
        user: {
          created_by_teacher_id: teacherId
        }
      },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { earned_at: 'desc' },
      take: 5
    });

    const activeToday = await this.prisma.user.count({
      where: {
        created_by_teacher_id: teacherId,
        role: 'student',
        last_active: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    return {
      totalStudents: students,
      totalClassCodes: classCodes,
      activeToday,
      recentBadges
    };
  }

  /**
   * Create a student without requiring class code (simpler version)
   */
  async createStudentSimple(teacherId: number, data: {
    name: string;
    email: string;
    pin_code?: string;
  }) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new BadRequestException('A user with this email already exists');
    }

    // Get teacher info for class code
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Generate PIN code
    const pinCode = data.pin_code || Math.floor(1000 + Math.random() * 9000).toString();

    // Create student account
    const student = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: 'student',
        pin_code: pinCode,
        created_by_teacher_id: teacherId,
        is_verified: false
      }
    });

    // Return response matching frontend expectations
    return {
      id: student.id,
      name: student.name,
      email: student.email,
      pin: pinCode,
      classCode: teacher.name || 'Teacher',
      createdAt: student.created_at.toISOString()
    };
  }

  /**
   * Get students in simple format for teacher dashboard
   */
  async getMyStudentsSimple(teacherId: number) {
    const students = await this.prisma.user.findMany({
      where: {
        created_by_teacher_id: teacherId,
        role: 'student'
      },
      include: {
        progress_events: {
          select: {
            event_type: true,
            course_id: true
          }
        },
        badges: true
      },
      orderBy: { created_at: 'desc' }
    });

    // Get teacher info
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId }
    });

    return students.map(student => {
      // Calculate total XP from badges (each badge could have XP value)
      const totalXP = student.badges.length * 100; // Simple calculation

      // Calculate progress percentage
      const completedCourses = new Set(
        student.progress_events
          .filter(e => e.event_type === 'course_completed')
          .map(e => e.course_id)
      ).size;
      const progress = Math.min(100, completedCourses * 25); // Estimate

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        classCode: teacher?.name || 'Teacher',
        progress,
        totalXP,
        badges: student.badges.length,
        lastActive: student.last_active?.toISOString() || student.created_at.toISOString()
      };
    });
  }

  /**
   * Get teacher statistics for dashboard
   */
  async getTeacherStats(teacherId: number) {
    const students = await this.prisma.user.findMany({
      where: {
        created_by_teacher_id: teacherId,
        role: 'student'
      },
      include: {
        progress_events: {
          select: {
            event_type: true,
            course_id: true
          }
        },
        badges: true
      }
    });

    const totalStudents = students.length;

    const activeToday = students.filter(s => {
      if (!s.last_active) return false;
      const lastActive = new Date(s.last_active);
      const today = new Date();
      return lastActive.toDateString() === today.toDateString();
    }).length;

    const totalXP = students.reduce((sum, s) => sum + (s.badges.length * 100), 0);

    const avgProgress = totalStudents > 0
      ? Math.round(students.reduce((sum, s) => {
          const completedCourses = new Set(
            s.progress_events
              .filter(e => e.event_type === 'course_completed')
              .map(e => e.course_id)
          ).size;
          return sum + Math.min(100, completedCourses * 25);
        }, 0) / totalStudents)
      : 0;

    return {
      totalStudents,
      activeToday,
      avgProgress,
      totalXP
    };
  }
}
