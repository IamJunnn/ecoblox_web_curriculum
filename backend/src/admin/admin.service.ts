import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // ============ HELPER METHODS ============
  private buildCreationMessage(
    studentEmailSent: boolean,
    parentEmailSent: boolean,
    studentEmail: string,
    parentEmail?: string,
  ): string {
    const messages: string[] = ['Student created successfully.'];

    if (studentEmailSent) {
      messages.push(`Welcome email sent to student (${studentEmail}).`);
    } else {
      messages.push(`Failed to send email to student - please manually provide credentials.`);
    }

    if (parentEmail) {
      if (parentEmailSent) {
        messages.push(`Parent notification sent to ${parentEmail}.`);
      } else {
        messages.push(`Failed to send parent notification to ${parentEmail}.`);
      }
    }

    return messages.join(' ');
  }

  // ============ STUDENT MANAGEMENT ============
  async getAllStudents() {
    const students = await this.prisma.user.findMany({
      where: { role: 'student' },
      select: {
        id: true,
        name: true,
        email: true,
        pin_code: true,
        parent_email: true,
        parent_name: true,
        class_codes: true,
        created_at: true,
        last_active: true,
        is_verified: true,
        created_by_teacher_id: true,
        progress_events: {
          select: {
            course_id: true,
            event_type: true,
            step_number: true,
            level_number: true,
            is_checked: true,
            timestamp: true,
          },
        },
        badges: {
          include: {
            course: {
              select: {
                title: true,
                badge_name: true,
              },
            },
          },
        },
        game_enrollments: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Get all courses for progress calculation
    // Only include real courses (course_order <= 4), not placeholder courses
    const allCourses = await this.prisma.course.findMany({
      where: {
        course_order: {
          lte: 4,  // Only include courses 1-4 (hide placeholder courses 5-30)
        },
      },
      select: {
        id: true,
        total_steps: true,
        game_id: true,
      },
    });

    // Create a map of course_id -> total_steps
    const courseStepsMap = new Map(allCourses.map(c => [c.id, c.total_steps]));

    // Process each student
    const processedStudents = await Promise.all(
      students.map(async (student) => {
        // Fetch teacher info if student was created by a teacher
        let teacherName: string | null = null;
        if (student.created_by_teacher_id) {
          const teacher = await this.prisma.user.findUnique({
            where: { id: student.created_by_teacher_id },
            select: { name: true },
          });
          teacherName = teacher?.name || null;
        }

        // Calculate progress based on ALL enrolled courses (like student dashboard)
        // Get all enrolled courses from game enrollments
        const enrolledCourses = new Set<number>();
        for (const enrollment of student.game_enrollments) {
          // Add all courses from the enrolled game
          const gameCourses = allCourses.filter(c => c.game_id === enrollment.game_id);
          gameCourses.forEach(c => enrolledCourses.add(c.id));
        }

        // Count unique CHECKED steps per course (level + step combination)
        const stepsByCourse = new Map<number, Set<string>>();
        let totalStepsCompleted = 0;

        for (const event of student.progress_events) {
          if (event.event_type === 'step_checked' &&
              event.step_number !== null &&
              event.level_number !== null &&
              event.is_checked !== false) {  // Only count checked steps (true or null for backward compat)
            const courseId = event.course_id;
            const stepKey = `${event.level_number}-${event.step_number}`;

            if (!stepsByCourse.has(courseId)) {
              stepsByCourse.set(courseId, new Set());
            }

            // Add unique level-step combination
            stepsByCourse.get(courseId)!.add(stepKey);
          }
        }

        // Calculate total steps completed across all courses
        for (const steps of stepsByCourse.values()) {
          totalStepsCompleted += steps.size;
        }

        // Calculate progress based on completed courses (matches student dashboard)
        let completedCoursesCount = 0;
        const totalCoursesCount = enrolledCourses.size;

        for (const courseId of enrolledCourses) {
          const course = allCourses.find(c => c.id === courseId);
          if (course && course.total_steps > 0) {
            const stepsCompleted = stepsByCourse.get(courseId)?.size || 0;
            // A course is completed if all steps are done
            if (stepsCompleted >= course.total_steps) {
              completedCoursesCount++;
            }
          }
        }

        const progress = totalCoursesCount > 0 ? Math.round((completedCoursesCount / totalCoursesCount) * 100) : 0;

        // Calculate total XP (10 XP per step completed)
        const totalXP = totalStepsCompleted * 10;

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          pin_code: student.pin_code,
          class_codes: student.class_codes ? JSON.parse(student.class_codes) : [],
          created_by_teacher_id: student.created_by_teacher_id,
          teacher_name: teacherName,
          progress,
          totalXP,
          badges: student.badges.length,
          last_active: student.last_active ? student.last_active.toISOString() : null,
          created_at: student.created_at.toISOString(),
          badge_count: student.badges.length,
          enrolled_games: student.game_enrollments.map(e => e.game),
        };
      })
    );

    return processedStudents;
  }

  async getStudentById(id: number) {
    const student = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'student',
      },
      include: {
        progress_events: {
          include: {
            course: true,
          },
          orderBy: { timestamp: 'desc' },
        },
        badges: {
          include: {
            course: true,
          },
        },
        game_enrollments: {
          include: {
            game: {
              include: {
                courses: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Fetch teacher info if student was created by a teacher
    let teacher: { id: number; name: string; email: string; classCode: string } | null = null;
    if (student.created_by_teacher_id) {
      const teacherData = await this.prisma.user.findUnique({
        where: { id: student.created_by_teacher_id },
        select: { id: true, name: true, email: true },
      });
      if (teacherData) {
        // Get teacher's class code
        const classCode = await this.prisma.classCode.findFirst({
          where: { teacher_id: student.created_by_teacher_id },
          select: { code: true },
        });
        teacher = {
          id: teacherData.id,
          name: teacherData.name,
          email: teacherData.email,
          classCode: classCode?.code || 'N/A',
        };
      }
    }

    // Calculate progress metrics
    // Only include real courses (course_order <= 4), not placeholder courses
    const allCourses = await this.prisma.course.findMany({
      where: {
        course_order: {
          lte: 4,  // Only include courses 1-4 (hide placeholder courses 5-30)
        },
      },
      select: {
        id: true,
        title: true,
        total_steps: true,
        game_id: true,
      },
    });

    // Build course progress map
    const courseProgressMap = new Map();
    const completedCourses = new Set();

    for (const event of student.progress_events) {
      if (!courseProgressMap.has(event.course_id)) {
        courseProgressMap.set(event.course_id, {
          courseId: event.course_id,
          completedSteps: new Set(),
          lastAccessed: event.timestamp,
        });
      }

      const courseProgress = courseProgressMap.get(event.course_id);
      if (event.event_type === 'step_checked' &&
          event.step_number !== null &&
          event.level_number !== null &&
          event.is_checked !== false) {
        // Use unique level-step combination like in getAllStudents
        const stepKey = `${event.level_number}-${event.step_number}`;
        courseProgress.completedSteps.add(stepKey);
      }
      if (event.event_type === 'course_completed') {
        completedCourses.add(event.course_id);
      }

      // Update last accessed time
      if (event.timestamp > courseProgress.lastAccessed) {
        courseProgress.lastAccessed = event.timestamp;
      }
    }

    // Get all enrolled courses from game enrollments
    const enrolledCourseIds = new Set<number>();
    for (const enrollment of student.game_enrollments) {
      const gameCourses = allCourses.filter(c => c.game_id === enrollment.game_id);
      gameCourses.forEach(c => enrolledCourseIds.add(c.id));
    }

    // Calculate overall progress based on completed courses (matches student dashboard)
    let completedCoursesCount = 0;
    const totalCoursesCount = enrolledCourseIds.size;
    let totalStepsCompleted = 0;

    for (const courseId of enrolledCourseIds) {
      const course = allCourses.find(c => c.id === courseId);
      if (course && course.total_steps > 0) {
        const progress = courseProgressMap.get(courseId);
        const stepsCompleted = progress?.completedSteps?.size || 0;
        totalStepsCompleted += stepsCompleted;

        // A course is completed if all steps are done
        if (stepsCompleted >= course.total_steps) {
          completedCoursesCount++;
        }
      }
    }

    const overallProgress = totalCoursesCount > 0 ? Math.round((completedCoursesCount / totalCoursesCount) * 100) : 0;

    // Calculate total XP (10 XP per step completed)
    const totalXP = totalStepsCompleted * 10;

    // Build course progress array for response
    const courseProgress = Array.from(courseProgressMap.entries()).map(([courseId, progress]) => {
      const course = allCourses.find(c => c.id === courseId);
      if (!course) return null;

      const stepsCompleted = progress.completedSteps.size;
      const courseProgress = Math.round((stepsCompleted / course.total_steps) * 100);
      const courseXP = stepsCompleted * 10;

      return {
        courseId: course.id,
        courseName: course.title,
        completed: completedCourses.has(courseId),
        progress: courseProgress,
        xp: courseXP,
        lastAccessed: progress.lastAccessed.toISOString(),
      };
    }).filter(cp => cp !== null);

    // Get first class code if available
    const classCodes = student.class_codes ? JSON.parse(student.class_codes) : [];
    const classCode = classCodes.length > 0 ? classCodes[0] : 'N/A';

    return {
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        pin: student.pin_code || 'N/A',
        classCode,
        teacher,
        progress: overallProgress,
        totalXP,
        coursesCompleted: completedCourses.size,
        totalCourses: enrolledCourseIds.size,
        badgesEarned: student.badges.length,
        lastActive: student.last_active ? student.last_active.toISOString() : new Date().toISOString(),
        createdAt: student.created_at.toISOString(),
      },
      courseProgress,
    };
  }

  async createStudent(createStudentDto: any) {
    const { email, name, password, pin_code, parent_email, parent_name, class_codes, teacher_id, game_id } = createStudentDto;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Generate PIN if not provided (4-digit random number)
    const finalPinCode = pin_code || Math.floor(1000 + Math.random() * 9000).toString();

    // Hash password if provided
    let password_hash: string | null = null;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    // Create student
    const student = await this.prisma.user.create({
      data: {
        email,
        name,
        password_hash,
        pin_code: finalPinCode,
        role: 'student',
        parent_email,
        parent_name,
        class_codes: class_codes ? JSON.stringify(class_codes) : null,
        created_by_teacher_id: teacher_id,
        is_verified: true, // Auto-verify admin-created accounts
      },
    });

    // Process class codes and create game enrollments
    if (class_codes && Array.isArray(class_codes)) {
      for (const code of class_codes) {
        const classCode = await this.prisma.classCode.findUnique({
          where: { code },
        });

        if (classCode) {
          await this.prisma.gameEnrollment.create({
            data: {
              user_id: student.id,
              game_id: classCode.game_id,
              class_code: code,
              unlocked_by: teacher_id,
            },
          });
        }
      }
    }

    // Create game enrollment if game_id is provided
    if (game_id) {
      // Check if game exists
      const game = await this.prisma.game.findUnique({
        where: { id: game_id },
      });

      if (game) {
        // Generate a generic class code for admin-created enrollments
        const genericClassCode = `ADMIN-${student.id}-${game_id}`;

        // Check if enrollment already exists (in case class_codes also enrolled this game)
        const existingEnrollment = await this.prisma.gameEnrollment.findUnique({
          where: {
            user_id_game_id: {
              user_id: student.id,
              game_id: game_id,
            },
          },
        });

        if (!existingEnrollment) {
          await this.prisma.gameEnrollment.create({
            data: {
              user_id: student.id,
              game_id: game_id,
              class_code: genericClassCode,
              unlocked_by: teacher_id,
            },
          });
        }
      }
    }

    // Send welcome email to student with their login credentials
    let studentEmailSent = false;
    try {
      await this.emailService.sendStudentWelcome(
        student.email,
        student.name,
        finalPinCode,
      );
      console.log(`✅ Welcome email sent to student: ${student.email}`);
      studentEmailSent = true;
    } catch (emailError) {
      // Log error but don't fail student creation
      console.error('❌ Failed to send welcome email to student:', emailError);
      // The student is still created successfully, just the email failed
    }

    // Send notification email to parent if parent_email is provided
    let parentEmailSent = false;
    if (parent_email) {
      try {
        await this.emailService.sendParentNotification(
          parent_email,
          parent_name || 'Parent/Guardian',
          student.name,
          student.email,
          finalPinCode,
        );
        console.log(`✅ Parent notification email sent to: ${parent_email}`);
        parentEmailSent = true;
      } catch (emailError) {
        // Log error but don't fail student creation
        console.error('❌ Failed to send parent notification email:', emailError);
        // The student is still created successfully, just the email failed
      }
    }

    // Return formatted response with all important info
    return {
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        pin: finalPinCode,
        createdAt: student.created_at.toISOString(),
      },
      emailSent: studentEmailSent,
      parentEmailSent,
      message: this.buildCreationMessage(studentEmailSent, parentEmailSent, student.email, parent_email),
    };
  }

  async updateStudent(id: number, updateStudentDto: any) {
    const { email, name, password, pin_code, parent_email, parent_name, class_codes, game_id, teacher_id } = updateStudentDto;

    // Check if student exists
    const student = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'student',
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Prepare update data
    const updateData: any = {
      email,
      name,
      pin_code,
      parent_email,
      parent_name,
      class_codes: class_codes ? JSON.stringify(class_codes) : student.class_codes,
    };

    // Update teacher assignment if provided
    if (teacher_id !== undefined) {
      updateData.created_by_teacher_id = teacher_id || null;
    }

    // Hash new password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // Update student
    const updatedStudent = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Handle game enrollment update if game_id is provided
    if (game_id !== undefined && game_id !== null) {
      // Get existing enrollments
      const existingEnrollments = await this.prisma.gameEnrollment.findMany({
        where: { user_id: id },
      });

      // Check if student is already enrolled in this game
      const alreadyEnrolled = existingEnrollments.some(e => e.game_id === game_id);

      if (!alreadyEnrolled) {
        // Remove old enrollments (keep it simple: one game at a time for now)
        await this.prisma.gameEnrollment.deleteMany({
          where: { user_id: id },
        });

        // Create new enrollment with a default class code based on game
        const game = await this.prisma.game.findUnique({
          where: { id: game_id },
          select: { name: true },
        });

        const classCode = `GAME${game_id}-${Date.now()}`;

        await this.prisma.gameEnrollment.create({
          data: {
            user_id: id,
            game_id: game_id,
            class_code: classCode,
            unlocked_by: teacher_id || student.created_by_teacher_id,
          },
        });
      }
    }

    // Update game enrollments if class codes changed (legacy support)
    if (class_codes && Array.isArray(class_codes)) {
      // Remove old enrollments
      await this.prisma.gameEnrollment.deleteMany({
        where: { user_id: id },
      });

      // Add new enrollments
      for (const code of class_codes) {
        const classCode = await this.prisma.classCode.findUnique({
          where: { code },
        });

        if (classCode) {
          await this.prisma.gameEnrollment.create({
            data: {
              user_id: id,
              game_id: classCode.game_id,
              class_code: code,
            },
          });
        }
      }
    }

    return updatedStudent;
  }

  async resetStudentProgress(id: number) {
    const student = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'student',
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Delete all progress-related data in a transaction
    await this.prisma.$transaction(async (prisma) => {
      // Delete all progress events
      await prisma.progressEvent.deleteMany({
        where: { user_id: id },
      });

      // Delete all badges
      await prisma.studentBadge.deleteMany({
        where: { user_id: id },
      });
    });

    return {
      success: true,
      message: `Progress reset successfully for student ${student.name}`,
    };
  }

  async deleteStudent(id: number) {
    const student = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'student',
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Delete related records in a transaction
    await this.prisma.$transaction(async (prisma) => {
      // Delete game enrollments
      await prisma.gameEnrollment.deleteMany({
        where: { user_id: id },
      });

      // Delete progress events (has cascade but being explicit)
      await prisma.progressEvent.deleteMany({
        where: { user_id: id },
      });

      // Delete badges (has cascade but being explicit)
      await prisma.studentBadge.deleteMany({
        where: { user_id: id },
      });

      // Finally delete the user
      await prisma.user.delete({
        where: { id },
      });
    });

    return { message: 'Student deleted successfully' };
  }

  // ============ TEACHER MANAGEMENT ============
  async getAllTeachers() {
    const teachers = await this.prisma.user.findMany({
      where: { role: 'teacher' },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        last_active: true,
        is_verified: true,
      },
      orderBy: { created_at: 'desc' },
    });

    // Get class codes and student counts for each teacher
    const teachersWithStats = await Promise.all(
      teachers.map(async (teacher) => {
        const classCodes = await this.prisma.classCode.findMany({
          where: { teacher_id: teacher.id },
          include: {
            game: {
              select: {
                name: true,
              },
            },
          },
        });

        const studentCount = await this.prisma.user.count({
          where: {
            role: 'student',
            created_by_teacher_id: teacher.id,
          },
        });

        return {
          ...teacher,
          class_codes: classCodes,
          student_count: studentCount,
        };
      })
    );

    return teachersWithStats;
  }

  async getTeacherById(id: number) {
    const teacher = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'teacher',
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    // Get class codes
    const classCodes = await this.prisma.classCode.findMany({
      where: { teacher_id: id },
      include: {
        game: true,
      },
    });

    // Get students created by this teacher
    const students = await this.prisma.user.findMany({
      where: {
        role: 'student',
        created_by_teacher_id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });

    return {
      ...teacher,
      class_codes: classCodes,
      students,
    };
  }

  async createTeacher(createTeacherDto: any) {
    const { email, name, class_code } = createTeacherDto;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Generate an invitation token for the teacher to set their own password
    const invitationToken = randomBytes(32).toString('hex');

    // Create teacher without password (they'll set it up via invitation link)
    const teacher = await this.prisma.user.create({
      data: {
        email,
        name,
        role: 'teacher',
        invitation_token: invitationToken,
        is_verified: false, // Will be verified when they set up password
      },
    });

    // If class_code is provided, create it
    if (class_code) {
      // Get the first game (or you could make this configurable)
      const game = await this.prisma.game.findFirst({
        orderBy: { id: 'asc' },
      });

      if (game) {
        await this.prisma.classCode.create({
          data: {
            code: class_code,
            teacher_id: teacher.id,
            teacher_name: teacher.name,
            game_id: game.id,
          },
        });
      }
    }

    // Create invitation link
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const invitationLink = `${baseUrl}/auth/setup-password?token=${invitationToken}`;

    // Send invitation email
    await this.emailService.sendTeacherInvitation(
      teacher.email,
      teacher.name,
      invitationLink,
    );

    return {
      success: true,
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        class_code: class_code || null,
        role: teacher.role,
        is_verified: teacher.is_verified,
      },
      invitation_token: invitationToken,
      invitation_link: invitationLink,
    };
  }

  async updateTeacher(id: number, updateTeacherDto: any) {
    const { email, name, password } = updateTeacherDto;

    // Check if teacher exists
    const teacher = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'teacher',
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    // Prepare update data
    const updateData: any = {
      email,
      name,
    };

    // Hash new password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // Update teacher
    const updatedTeacher = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return updatedTeacher;
  }

  async deleteTeacher(id: number) {
    const teacher = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'teacher',
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    // Check if teacher has any students
    const studentsCount = await this.prisma.user.count({
      where: {
        created_by_teacher_id: id
      },
    });

    if (studentsCount > 0) {
      throw new BadRequestException(`Cannot delete teacher with ${studentsCount} active students. Please reassign or delete the students first.`);
    }

    // Delete teacher and related data in a transaction
    await this.prisma.$transaction(async (prisma) => {
      // Delete class codes associated with this teacher
      await prisma.classCode.deleteMany({
        where: { teacher_id: id },
      });

      // Delete the teacher user
      await prisma.user.delete({
        where: { id },
      });
    });

    return { message: 'Teacher deleted successfully' };
  }

  // ============ STATISTICS ============
  async getAdminStats() {
    const [
      totalStudents,
      totalTeachers,
      totalGames,
      totalCourses,
      totalBadges,
      recentActivity,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'student' } }),
      this.prisma.user.count({ where: { role: 'teacher' } }),
      this.prisma.game.count(),
      this.prisma.course.count(),
      this.prisma.studentBadge.count(),
      this.prisma.progressEvent.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
      }),
    ]);

    return {
      totalStudents,
      totalTeachers,
      totalGames,
      totalCourses,
      totalBadges,
      recentActivity: recentActivity.map(event => ({
        student_name: event.user.name,
        course_title: event.course.title,
        event_type: event.event_type,
        timestamp: event.timestamp,
      })),
    };
  }

  // ============ GAME MANAGEMENT ============
  async getAllGames() {
    const games = await this.prisma.game.findMany({
      include: {
        courses: {
          orderBy: { course_order: 'asc' },
        },
        enrollments: true,
      },
      orderBy: { display_order: 'asc' },
    });

    const gamesWithStats = games.map(game => ({
      ...game,
      total_courses: game.courses.length,
      total_students: game.enrollments.length,
    }));

    return {
      success: true,
      games: gamesWithStats,
      count: gamesWithStats.length,
    };
  }

  async getStudentsByGame(gameId: number) {
    const enrollments = await this.prisma.gameEnrollment.findMany({
      where: { game_id: gameId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            badges: {
              where: {
                course: {
                  game_id: gameId,
                },
              },
            },
            progress_events: {
              where: {
                course: {
                  game_id: gameId,
                },
              },
            },
          },
        },
      },
    });

    return enrollments.map(enrollment => ({
      ...enrollment.user,
      enrolled_at: enrollment.enrolled_at,
      class_code: enrollment.class_code,
      badges_earned: enrollment.user.badges.length,
      progress_events: enrollment.user.progress_events.length,
    }));
  }
}