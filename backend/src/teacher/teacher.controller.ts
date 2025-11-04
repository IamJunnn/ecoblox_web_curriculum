import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/teacher')
@UseGuards(JwtAuthGuard)
export class TeacherController {
  constructor(private teacherService: TeacherService) {}

  /**
   * Create a new student (simpler endpoint matching frontend API)
   */
  @Post('students')
  @HttpCode(HttpStatus.CREATED)
  async createStudentSimple(
    @Request() req,
    @Body() body: {
      name: string;
      email: string;
      pin_code?: string;
    }
  ) {
    const result = await this.teacherService.createStudentSimple(req.user.id, body);
    return {
      success: true,
      student: result
    };
  }

  /**
   * Get all students for teacher (matching frontend API)
   */
  @Get('students')
  async getStudentsSimple(@Request() req) {
    const students = await this.teacherService.getMyStudentsSimple(req.user.id);
    return {
      success: true,
      students
    };
  }

  /**
   * Get teacher stats (matching frontend API)
   */
  @Get('stats')
  async getStats(@Request() req) {
    const stats = await this.teacherService.getTeacherStats(req.user.id);
    return {
      success: true,
      stats
    };
  }

  /**
   * Get teacher dashboard stats
   */
  @Get('dashboard')
  async getDashboard(@Request() req) {
    // TODO: Add role check to ensure user is a teacher
    return this.teacherService.getDashboardStats(req.user.id);
  }

  /**
   * Generate a new class code
   */
  @Post('class-code/generate')
  async generateClassCode(
    @Request() req,
    @Body() body: { gameId: number }
  ) {
    const code = await this.teacherService.generateClassCode(
      req.user.id,
      req.user.name || 'Teacher',
      body.gameId
    );
    return { code };
  }

  /**
   * Get all class codes for teacher
   */
  @Get('class-codes')
  async getClassCodes(@Request() req) {
    return this.teacherService.getMyClassCodes(req.user.id);
  }

  /**
   * Create a new student
   */
  @Post('students/create')
  @HttpCode(HttpStatus.CREATED)
  async createStudent(
    @Request() req,
    @Body() body: {
      name: string;
      email: string;
      parentEmail: string;
      parentName?: string;
      usePin?: boolean;
      classCode: string;
    }
  ) {
    return this.teacherService.createStudent(req.user.id, body);
  }

  /**
   * Get all students for teacher
   */
  @Get('students')
  async getStudents(@Request() req) {
    return this.teacherService.getMyStudents(req.user.id);
  }

  /**
   * Get specific student's progress
   */
  @Get('students/:studentId/progress')
  async getStudentProgress(
    @Request() req,
    @Param('studentId', ParseIntPipe) studentId: number
  ) {
    return this.teacherService.getStudentProgress(req.user.id, studentId);
  }

  /**
   * Reset student progress
   */
  @Post('students/:studentId/reset-progress')
  async resetStudentProgress(
    @Request() req,
    @Param('studentId', ParseIntPipe) studentId: number
  ) {
    return this.teacherService.resetStudentProgress(req.user.id, studentId);
  }

  /**
   * Unlock a game for a student
   */
  @Post('students/:studentId/unlock-game')
  async unlockGame(
    @Request() req,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() body: { gameId: number; classCode: string }
  ) {
    return this.teacherService.unlockGameForStudent(
      req.user.id,
      studentId,
      body.gameId,
      body.classCode
    );
  }

  /**
   * Bulk create students
   */
  @Post('students/bulk-create')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreateStudents(
    @Request() req,
    @Body() body: {
      classCode: string;
      students: Array<{
        name: string;
        email: string;
        parentEmail: string;
        parentName?: string;
      }>;
    }
  ) {
    const createdStudents: any[] = [];
    const errors: any[] = [];

    for (const studentData of body.students) {
      try {
        const student = await this.teacherService.createStudent(req.user.id, {
          ...studentData,
          classCode: body.classCode,
          usePin: true // Default to PIN for bulk creation
        });
        createdStudents.push(student);
      } catch (error) {
        errors.push({
          student: studentData.name,
          error: error.message
        });
      }
    }

    return {
      created: createdStudents,
      errors,
      summary: {
        total: body.students.length,
        successful: createdStudents.length,
        failed: errors.length
      }
    };
  }
}
