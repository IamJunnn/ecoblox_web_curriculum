import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all courses for a student based on their game enrollments
   * If userId is provided, only return courses from games the student is enrolled in
   * If userId is not provided, return all courses
   */
  async getCourses(userId?: number) {
    if (userId) {
      // Get student's game enrollments
      const enrollments = await this.prisma.gameEnrollment.findMany({
        where: { user_id: userId },
        select: { game_id: true },
      });

      if (enrollments.length === 0) {
        // Student not enrolled in any games, return empty array
        return { courses: [] };
      }

      const gameIds = enrollments.map(e => e.game_id);

      console.log(`📚 Getting courses for user ${userId}, enrolled in games: ${gameIds.join(', ')}`);

      // Check if student has completed the foundational courses (courses 1-3 from Game 1)
      const hasCompletedFoundation = await this.prisma.progressEvent.findFirst({
        where: {
          user_id: userId,
          course_id: 3, // Studio Basics (last foundational course)
          event_type: 'course_completed',
        },
      });

      // Determine which courses to show
      let courseFilter: any = {
        game_id: {
          in: gameIds,
        },
      };

      // If student is NOT enrolled in Game 1, skip foundational courses (1-3)
      // If student IS enrolled in Game 1, show all courses for Game 1
      const isEnrolledInGame1 = gameIds.includes(1);

      console.log(`🎮 Is enrolled in Game 1: ${isEnrolledInGame1}`);

      if (!isEnrolledInGame1) {
        // Not enrolled in Game 1, so skip foundational courses
        // Only show courses with course_order >= 4 OR courses from other games that don't have prerequisites
        courseFilter = {
          OR: [
            {
              game_id: {
                in: gameIds.filter(id => id !== 1),
              },
            },
          ],
        };
        console.log(`🔍 Filtering out Game 1 courses, filter:`, courseFilter);
      } else {
        console.log(`✅ Showing all Game 1 courses`);
      }

      // Get courses from enrolled games
      const courses = await this.prisma.course.findMany({
        where: courseFilter,
        include: {
          game: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { game_id: 'asc' },
          { course_order: 'asc' },
        ],
      });

      console.log(`📖 Found ${courses.length} courses:`, courses.map(c => `${c.title} (Game ${c.game_id})`));

      // Add isLocked status for each course based on prerequisites
      const coursesWithLockStatus = await Promise.all(
        courses.map(async (course) => {
          let isLocked = false;

          // Courses 1, 2, 3 are always unlocked (foundational courses)
          if (course.id <= 3) {
            isLocked = false;
          } else if (course.requires_course) {
            // Check if the prerequisite course is completed
            const prerequisiteCompleted = await this.prisma.progressEvent.findFirst({
              where: {
                user_id: userId,
                course_id: course.requires_course,
                event_type: 'course_completed',
              },
            });

            isLocked = !prerequisiteCompleted;
          }

          return {
            ...course,
            isLocked,
          };
        })
      );

      return { courses: coursesWithLockStatus };
    } else {
      // Return all courses (for admin/teacher views)
      const courses = await this.prisma.course.findMany({
        include: {
          game: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { game_id: 'asc' },
          { course_order: 'asc' },
        ],
      });

      return { courses };
    }
  }

  /**
   * Get a single course by ID
   * Optionally check if it's locked for a specific user
   */
  async getCourse(courseId: number, userId?: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        game: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    // Add isLocked status if userId is provided
    let isLocked = false;
    let prerequisiteCourseName: string | null = null;

    if (userId) {
      // Courses 1, 2, 3 are always unlocked (foundational courses)
      if (course.id <= 3) {
        isLocked = false;
      } else if (course.requires_course) {
        // Check if the prerequisite course is completed
        const prerequisiteCompleted = await this.prisma.progressEvent.findFirst({
          where: {
            user_id: userId,
            course_id: course.requires_course,
            event_type: 'course_completed',
          },
        });

        isLocked = !prerequisiteCompleted;

        // Get prerequisite course name for display
        if (isLocked) {
          const prerequisiteCourse = await this.prisma.course.findUnique({
            where: { id: course.requires_course },
            select: { title: true },
          });
          prerequisiteCourseName = prerequisiteCourse?.title || 'the previous course';
        }
      }
    }

    return {
      course: {
        ...course,
        isLocked,
        prerequisiteCourseName,
      }
    };
  }
}
