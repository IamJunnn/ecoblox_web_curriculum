import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgressDto } from './dto/create-progress.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  // Create a progress event
  async createProgressEvent(dto: CreateProgressDto) {
    try {
      // Prepare data object and include level if provided
      let dataObject = dto.data || {};
      if (dto.level !== undefined) {
        dataObject = { ...dataObject, level: dto.level };
      }

      // Convert data to JSON string
      const dataString = Object.keys(dataObject).length > 0 ? JSON.stringify(dataObject) : null;

      // Extract level_number and step_number
      const levelNumber = dto.level !== undefined ? dto.level : null;
      let stepNumber: number | null = null;

      if (dto.event_type === 'step_checked' && dataObject) {
        stepNumber = dataObject.step !== undefined ? dataObject.step : dataObject.stepNumber || null;
      }

      // Use upsert for step_checked and quiz_answered events to prevent duplicates
      let progressEvent;
    if (dto.event_type === 'step_checked' && stepNumber !== null && levelNumber !== null) {
      // Extract is_checked from data (defaults to true if not provided for backward compatibility)
      const isChecked = dataObject.is_checked !== undefined ? dataObject.is_checked : true;

      // Upsert for step checkboxes
      progressEvent = await this.prisma.progressEvent.upsert({
        where: {
          user_id_course_id_event_type_level_number_step_number: {
            user_id: dto.student_id,
            course_id: dto.course_id,
            event_type: dto.event_type,
            level_number: levelNumber,
            step_number: stepNumber,
          },
        },
        update: {
          is_checked: isChecked,
          data: dataString,
          timestamp: new Date(),
        },
        create: {
          user_id: dto.student_id,
          course_id: dto.course_id,
          event_type: dto.event_type,
          level_number: levelNumber,
          step_number: stepNumber,
          is_checked: isChecked,
          data: dataString,
        },
      });
    } else if (dto.event_type === 'quiz_answered' && levelNumber !== null) {
      // For quiz answers, manually check if one exists and update or create
      // (Prisma doesn't allow null in where clauses for unique constraints)
      const existingQuizAnswer = await this.prisma.progressEvent.findFirst({
        where: {
          user_id: dto.student_id,
          course_id: dto.course_id,
          event_type: dto.event_type,
          level_number: levelNumber,
          step_number: null,
        },
      });

      if (existingQuizAnswer) {
        // Update existing quiz answer
        progressEvent = await this.prisma.progressEvent.update({
          where: { id: existingQuizAnswer.id },
          data: {
            data: dataString,
            timestamp: new Date(),
          },
        });
      } else {
        // Create new quiz answer
        progressEvent = await this.prisma.progressEvent.create({
          data: {
            user_id: dto.student_id,
            course_id: dto.course_id,
            event_type: dto.event_type,
            level_number: levelNumber,
            step_number: null,
            data: dataString,
          },
        });
      }
    } else {
      // For other event types (course_completed, level_unlocked, etc.), use regular create
      progressEvent = await this.prisma.progressEvent.create({
        data: {
          user_id: dto.student_id,
          course_id: dto.course_id,
          event_type: dto.event_type,
          level_number: levelNumber,
          step_number: stepNumber,
          data: dataString,
        },
      });
    }

      // Check if course is completed and award badge if needed
      let badge: {
        badge_name: string;
        badge_icon: string | null;
        badge_message: string | null;
        course_title: string;
      } | null = null;
      if (dto.event_type === 'course_completed') {
        badge = await this.awardBadgeForCourse(dto.student_id, dto.course_id);
      }

      return {
        event: progressEvent,
        badge: badge,
      };
    } catch (error) {
      console.error('Error creating progress event:', error);
      console.error('DTO:', dto);
      throw error;
    }
  }

  // Award badge for completing a course
  private async awardBadgeForCourse(userId: number, courseId: number) {
    // Get course info
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) return null;

    // Check if badge already exists
    const existingBadge = await this.prisma.studentBadge.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: courseId,
        },
      },
    });

    if (existingBadge) {
      // Return existing badge with course info
      return {
        badge_name: course.badge_name,
        badge_icon: course.badge_icon,
        badge_message: course.badge_message,
        course_title: course.title,
      };
    }

    // Award the badge
    await this.prisma.studentBadge.create({
      data: {
        user_id: userId,
        course_id: courseId,
        badge_name: course.badge_name,
        game_id: course.game_id,
      },
    });

    // Return badge info
    return {
      badge_name: course.badge_name,
      badge_icon: course.badge_icon,
      badge_message: course.badge_message,
      course_title: course.title,
    };
  }

  // Get student overall progress and stats
  async getStudentProgress(studentId: number) {
    // Get all progress events for student
    const progressEvents = await this.prisma.progressEvent.findMany({
      where: { user_id: studentId },
      include: {
        course: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    // Get all badges
    const badges = await this.prisma.studentBadge.findMany({
      where: { user_id: studentId },
    });

    // Get enrolled games
    const enrollments = await this.prisma.gameEnrollment.findMany({
      where: { user_id: studentId },
      include: {
        game: {
          include: {
            courses: true,
          },
        },
      },
    });

    // Calculate stats
    const completedCourses = new Set(
      progressEvents
        .filter((e) => e.event_type === 'course_completed')
        .map((e) => e.course_id)
    );

    const totalXP = progressEvents.filter(
      (e) => e.event_type === 'step_checked'
    ).length * 10; // 10 XP per step

    const stepsCompleted = progressEvents.filter(
      (e) => e.event_type === 'step_checked'
    ).length;

    // Get current level (based on XP)
    const currentLevel = Math.floor(totalXP / 100) + 1;

    return {
      stats: {
        current_level: currentLevel,
        progress_percentage: 0, // Will be calculated on frontend
        total_xp: totalXP,
        quiz_score: '0/0',
        steps_completed: stepsCompleted,
        levels_unlocked: enrollments.length,
        courses_completed: completedCourses.size,
        badges_earned: badges.length,
      },
      progress_events: progressEvents,
      badges: badges,
    };
  }

  // Get student progress for a specific course
  async getStudentCourseProgress(studentId: number, courseId: number) {
    const progressEvents = await this.prisma.progressEvent.findMany({
      where: {
        user_id: studentId,
        course_id: courseId,
      },
      orderBy: { timestamp: 'desc' },
    });

    return {
      progress_events: progressEvents.map((event) => {
        // Parse the data to extract level information
        let parsedData: any = null;
        let level: number | null = null;

        if (event.data) {
          try {
            parsedData = JSON.parse(event.data);
            // Get level from data if it exists, otherwise use level_number
            level = parsedData?.level || event.level_number || null;
          } catch (e) {
            console.error('Failed to parse event data:', e);
          }
        }

        return {
          id: event.id,
          student_id: event.user_id,
          course_id: event.course_id,
          event_type: event.event_type,
          level: level,
          is_checked: event.is_checked, // Include is_checked field
          data: parsedData,
          timestamp: event.timestamp,
        };
      }),
    };
  }

  // Get leaderboard for a class
  async getLeaderboard(classCode: string, period: string = 'all', studentId?: number) {
    // Get students in this class
    const students = await this.prisma.user.findMany({
      where: {
        role: 'student',
        class_codes: {
          contains: classCode,
        },
      },
    });

    // Calculate XP for each student
    const leaderboardData = await Promise.all(
      students.map(async (student) => {
        let progressEvents = await this.prisma.progressEvent.findMany({
          where: { user_id: student.id },
        });

        // Filter by period if needed
        if (period === 'week') {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          progressEvents = progressEvents.filter(
            (e) => new Date(e.timestamp) >= oneWeekAgo
          );
        } else if (period === 'month') {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          progressEvents = progressEvents.filter(
            (e) => new Date(e.timestamp) >= oneMonthAgo
          );
        }

        const totalXP = progressEvents.filter(
          (e) => e.event_type === 'step_checked'
        ).length * 10;

        return {
          student_id: student.id,
          name: student.name,
          email: student.email,
          total_xp: totalXP,
        };
      })
    );

    // Sort by XP
    leaderboardData.sort((a, b) => b.total_xp - a.total_xp);

    // Add ranks
    const leaderboard = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Find current student
    const currentStudent = studentId
      ? leaderboard.find((entry) => entry.student_id === studentId)
      : null;

    return {
      leaderboard: leaderboard.slice(0, 10), // Top 10
      current_student: currentStudent,
    };
  }

  // Skip/complete a course (for students who already have prerequisite knowledge)
  async skipCourse(studentId: number, courseId: number, totalSteps: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Create individual step_checked events for all steps
    // Course 1 (Install Roblox Studio): 5 steps in level 1
    // Course 2 (Create Roblox Account): 7 steps in level 1
    // Course 3+ may have different structures
    for (let i = 0; i < totalSteps; i++) {
      await this.prisma.progressEvent.upsert({
        where: {
          user_id_course_id_event_type_level_number_step_number: {
            user_id: studentId,
            course_id: courseId,
            event_type: 'step_checked',
            level_number: 1,
            step_number: i,
          },
        },
        update: {
          data: JSON.stringify({ step: i, skipped: true }),
          timestamp: new Date(),
        },
        create: {
          user_id: studentId,
          course_id: courseId,
          event_type: 'step_checked',
          level_number: 1,
          step_number: i,
          data: JSON.stringify({ step: i, skipped: true }),
        },
      });
    }

    // Create quest_completed event
    await this.prisma.progressEvent.create({
      data: {
        user_id: studentId,
        course_id: courseId,
        event_type: 'quest_completed',
        level_number: 1,
        step_number: null,
        data: JSON.stringify({ all_steps_completed: true, skipped: true }),
      },
    });

    // Mark course as completed
    await this.prisma.progressEvent.create({
      data: {
        user_id: studentId,
        course_id: courseId,
        event_type: 'course_completed',
        level_number: 1,
        step_number: null,
        data: JSON.stringify({ skipped: true, totalSteps }),
      },
    });

    // Award badge
    await this.awardBadgeForCourse(studentId, courseId);

    return { success: true, message: 'Course skipped successfully' };
  }
}
