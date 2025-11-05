import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Plural /api/teachers controller to match frontend API expectations
 */
@Controller('api/teachers')
@UseGuards(JwtAuthGuard)
export class TeachersController {
  constructor(private teacherService: TeacherService) {}

  /**
   * Create a new student
   * POST /api/teachers/students
   */
  @Post('students')
  @HttpCode(HttpStatus.CREATED)
  async createStudent(
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
   * Get all students for teacher
   * GET /api/teachers/students
   */
  @Get('students')
  async getStudents(@Request() req) {
    const students = await this.teacherService.getMyStudentsSimple(req.user.id);
    return {
      success: true,
      students
    };
  }

  /**
   * Get teacher statistics
   * GET /api/teachers/stats
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
   * Get all available games/courses
   * GET /api/teachers/games
   */
  @Get('games')
  async getGames() {
    const games = await this.teacherService.getAllGames();
    return {
      success: true,
      games
    };
  }
}
