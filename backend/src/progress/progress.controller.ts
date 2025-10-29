import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // Create new progress event
  @Post()
  async createProgress(@Body() createProgressDto: CreateProgressDto) {
    const { student_id, course_id, event_type, level, data } =
      createProgressDto;

    const progressEvent = await this.progressService.createProgressEvent(
      student_id,
      course_id,
      event_type,
      level,
      data,
    );

    return {
      success: true,
      student_id,
      duplicate: false,
      message: 'Progress saved',
      event: progressEvent,
    };
  }

  // Get student progress
  @Get('student/:id')
  @UseGuards(JwtAuthGuard)
  async getStudentProgress(@Param('id') studentId: string) {
    const events = await this.progressService.getStudentProgress(+studentId);
    const stats = await this.progressService.getStudentStats(+studentId);

    return {
      student_id: +studentId,
      progress_events: events,
      stats,
    };
  }

  // Get student course progress
  @Get('student/:studentId/course/:courseId')
  @UseGuards(JwtAuthGuard)
  async getStudentCourseProgress(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    const events = await this.progressService.getStudentCourseProgress(
      +studentId,
      +courseId,
    );

    return {
      student_id: +studentId,
      course_id: +courseId,
      progress_events: events,
    };
  }

  // Get class leaderboard
  @Get('leaderboard/:classCode')
  async getLeaderboard(
    @Param('classCode') classCode: string,
    @Query('period') period?: 'all' | 'week' | 'month',
    @Query('studentId') studentId?: string,
  ) {
    const leaderboard = await this.progressService.getClassLeaderboard(
      classCode,
      period || 'all',
    );

    // Find current student if provided
    let currentStudent: any = null;
    if (studentId) {
      currentStudent = leaderboard.find((s) => s.student_id === +studentId);
      if (currentStudent) {
        // Calculate XP to next rank
        const nextRankStudent = leaderboard.find(
          (s) => s.rank === (currentStudent?.rank || 0) - 1,
        );
        if (nextRankStudent) {
          (currentStudent as any).xp_to_next_rank =
            nextRankStudent.total_xp - ((currentStudent as any)?.total_xp || 0) + 1;
        }
      }
    }

    return {
      class_code: classCode,
      period: period || 'all',
      total_students: leaderboard.length,
      leaderboard: leaderboard.slice(0, 10), // Top 10 students
      current_student: currentStudent,
    };
  }
}
