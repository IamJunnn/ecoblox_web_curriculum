import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgressEvent, EventType } from './entities/progress-event.entity';
import { Student } from '../students/entities/student.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(ProgressEvent)
    private progressRepository: Repository<ProgressEvent>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  // Create a new progress event
  async createProgressEvent(
    studentId: number,
    courseId: number,
    eventType: EventType | string,
    level?: number,
    data?: any,
  ): Promise<ProgressEvent | null> {
    // Check for duplicate events
    const isDuplicate = await this.checkDuplicateEvent(
      studentId,
      courseId,
      eventType,
      level,
      data,
    );

    if (isDuplicate) {
      // Return existing event instead of creating duplicate
      const existing = await this.progressRepository.findOne({
        where: {
          student_id: studentId,
          course_id: courseId,
          event_type: eventType as EventType,
          level: level,
        },
      });
      return existing || null;
    }

    const progressEvent = this.progressRepository.create({
      student_id: studentId,
      course_id: courseId,
      event_type: eventType as EventType,
      level: level,
      data: typeof data === 'string' ? data : JSON.stringify(data),
    });

    await this.progressRepository.save(progressEvent);

    // Update student's last active time
    await this.studentRepository.update(studentId, {
      last_active: new Date(),
    });

    return progressEvent;
  }

  // Check for duplicate events
  private async checkDuplicateEvent(
    studentId: number,
    courseId: number,
    eventType: EventType | string,
    level?: number,
    data?: any,
  ): Promise<boolean> {
    if (eventType === EventType.STEP_CHECKED && data) {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

      const existing = await this.progressRepository
        .createQueryBuilder('progress')
        .where('progress.student_id = :studentId', { studentId })
        .andWhere('progress.course_id = :courseId', { courseId })
        .andWhere('progress.event_type = :eventType', { eventType })
        .andWhere('progress.level = :level', { level })
        .andWhere(`json_extract(progress.data, '$.step') = :step`, {
          step: parsedData.step,
        })
        .getOne();

      return !!existing;
    }

    // Allow multiple quiz attempts - do not check for duplicates
    // This enables students to retake quizzes, and we'll use the most recent attempt
    if (eventType === EventType.QUIZ_ANSWERED) {
      return false; // Never treat quiz answers as duplicates
    }

    if (eventType === EventType.LEVEL_UNLOCKED || eventType === EventType.COURSE_COMPLETED) {
      const existing = await this.progressRepository.findOne({
        where: {
          student_id: studentId,
          course_id: courseId,
          event_type: eventType as EventType,
          level: level,
        },
      });

      return !!existing;
    }

    return false;
  }

  // Skip/complete a course (for students who already have the prerequisite)
  async skipCourse(
    studentId: number,
    courseId: number,
    totalSteps: number,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check if course is already completed
      const existingCompletion = await this.progressRepository.findOne({
        where: {
          student_id: studentId,
          course_id: courseId,
          event_type: EventType.COURSE_COMPLETED,
        },
      });

      if (existingCompletion) {
        return {
          success: true,
          message: 'Course already completed',
        };
      }

      // Mark all steps as checked (so progress tracking works correctly)
      for (let step = 0; step < totalSteps; step++) {
        await this.createProgressEvent(
          studentId,
          courseId,
          EventType.STEP_CHECKED,
          1,
          { step, skipped: true },
        );
      }

      // Mark quest as completed
      await this.createProgressEvent(
        studentId,
        courseId,
        EventType.QUEST_COMPLETED,
        0,
        { all_steps_completed: true, skipped: true },
      );

      // Mark course as completed
      await this.createProgressEvent(
        studentId,
        courseId,
        EventType.COURSE_COMPLETED,
        1,
        { skipped: true, reason: 'Already has prerequisite knowledge/software' },
      );

      return {
        success: true,
        message: 'Course marked as complete',
      };
    } catch (error) {
      console.error('Failed to skip course:', error);
      return {
        success: false,
        message: 'Failed to skip course',
      };
    }
  }

  // Get all progress events for a student
  async getStudentProgress(studentId: number): Promise<ProgressEvent[]> {
    return this.progressRepository.find({
      where: { student_id: studentId },
      relations: ['course'],
      order: { timestamp: 'DESC' },
    });
  }

  // Get progress for a specific course
  async getStudentCourseProgress(
    studentId: number,
    courseId: number,
  ): Promise<ProgressEvent[]> {
    return this.progressRepository.find({
      where: {
        student_id: studentId,
        course_id: courseId,
      },
      order: { timestamp: 'DESC' },
    });
  }

  // Calculate student stats
  async getStudentStats(studentId: number): Promise<any> {
    const events = await this.getStudentProgress(studentId);

    if (!events || events.length === 0) {
      return {
        current_level: 0,
        progress_percentage: 0,
        total_xp: 0,
        quiz_score: '0/0',
        steps_completed: 0,
        levels_unlocked: 0,
        courses_completed: 0,
      };
    }

    // Calculate levels unlocked
    const levelsUnlocked = new Set(
      events
        .filter((e) => e.event_type === EventType.LEVEL_UNLOCKED)
        .map((e) => e.level),
    );

    // Calculate steps completed
    const stepsCompleted = events.filter(
      (e) => e.event_type === EventType.STEP_CHECKED,
    ).length;

    // Calculate quiz score
    const quizEvents = events.filter((e) => e.event_type === EventType.QUIZ_ANSWERED);
    const correctQuizzes = quizEvents.filter((e) => {
      const data = JSON.parse(e.data || '{}');
      return data.correct === true;
    }).length;

    // Calculate XP
    const quizXP = correctQuizzes * 100;
    const stepXP = stepsCompleted * 20;
    const totalXP = quizXP + stepXP;

    // Calculate courses completed
    const coursesCompleted = new Set(
      events
        .filter((e) => e.event_type === EventType.COURSE_COMPLETED)
        .map((e) => e.course_id),
    ).size;

    // Get total courses for progress calculation
    const totalCourses = await this.courseRepository.count();
    const progressPercentage = Math.round(
      (coursesCompleted / totalCourses) * 100,
    );

    return {
      current_level: Math.max(...levelsUnlocked, 0),
      progress_percentage: progressPercentage,
      total_xp: totalXP,
      quiz_score: `${correctQuizzes}/${quizEvents.length}`,
      steps_completed: stepsCompleted,
      levels_unlocked: levelsUnlocked.size,
      courses_completed: coursesCompleted,
    };
  }

  // Get leaderboard for a class
  async getClassLeaderboard(
    classCode: string,
    period: 'all' | 'week' | 'month' = 'all',
  ): Promise<any[]> {
    // Get all students in the class
    const students = await this.studentRepository.find({
      where: {
        class_code: classCode,
        role: UserRole.STUDENT as any,
      },
    });

    if (!students || students.length === 0) {
      return [];
    }

    // Calculate date filter
    let dateFilter = new Date(0); // Beginning of time
    if (period === 'week') {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Calculate XP for each student
    const leaderboard = await Promise.all(
      students.map(async (student) => {
        const query = this.progressRepository
          .createQueryBuilder('progress')
          .where('progress.student_id = :studentId', {
            studentId: student.id,
          });

        if (period !== 'all') {
          query.andWhere('progress.timestamp >= :date', { date: dateFilter });
        }

        const events = await query.getMany();

        // Calculate XP
        let totalXP = 0;
        events.forEach((event) => {
          if (event.event_type === EventType.STEP_CHECKED) {
            totalXP += 20;
          } else if (event.event_type === EventType.QUIZ_ANSWERED) {
            const data = JSON.parse(event.data || '{}');
            if (data.correct) {
              totalXP += 100;
            }
          }
        });

        return {
          student_id: student.id,
          name: student.name,
          email: student.email,
          total_xp: totalXP,
          rank: 0, // Will be set later
        } as any;
      }),
    );

    // Sort by XP and add rank
    leaderboard.sort((a, b) => b.total_xp - a.total_xp);
    leaderboard.forEach((item, index) => {
      item.rank = index + 1;
    });

    return leaderboard;
  }
}
