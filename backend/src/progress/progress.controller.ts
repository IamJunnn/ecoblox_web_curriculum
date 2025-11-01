import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';

@Controller('api/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // POST /api/progress - Create a progress event
  @Post()
  async createProgress(@Body() createProgressDto: CreateProgressDto) {
    const result = await this.progressService.createProgressEvent(createProgressDto);
    return {
      success: true,
      ...result,
    };
  }

  // GET /api/progress/student/:studentId - Get overall student progress
  @Get('student/:studentId')
  async getStudentProgress(@Param('studentId') studentId: string) {
    return this.progressService.getStudentProgress(parseInt(studentId));
  }

  // GET /api/progress/student/:studentId/course/:courseId - Get student progress for a specific course
  @Get('student/:studentId/course/:courseId')
  async getStudentCourseProgress(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.getStudentCourseProgress(
      parseInt(studentId),
      parseInt(courseId),
    );
  }

  // GET /api/progress/leaderboard/:classCode - Get leaderboard for a class
  @Get('leaderboard/:classCode')
  async getLeaderboard(
    @Param('classCode') classCode: string,
    @Query('period') period?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.progressService.getLeaderboard(
      classCode,
      period || 'all',
      studentId ? parseInt(studentId) : undefined,
    );
  }

  // POST /api/progress/skip-course - Skip a course
  @Post('skip-course')
  async skipCourse(
    @Body() body: { student_id: number; course_id: number; total_steps: number },
  ) {
    return this.progressService.skipCourse(
      body.student_id,
      body.course_id,
      body.total_steps,
    );
  }
}
