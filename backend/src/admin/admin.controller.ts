import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============ STUDENT MANAGEMENT ============
  @Get('students')
  async getAllStudents() {
    const students = await this.adminService.getAllStudents();
    return {
      success: true,
      students,
      count: students.length,
    };
  }

  @Get('students/:id')
  async getStudentById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getStudentById(id);
  }

  @Post('students')
  async createStudent(@Body() createStudentDto: any) {
    return this.adminService.createStudent(createStudentDto);
  }

  @Put('students/:id')
  async updateStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: any,
  ) {
    return this.adminService.updateStudent(id, updateStudentDto);
  }

  @Delete('students/:id')
  async deleteStudent(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteStudent(id);
  }

  @Post('students/:id/reset-progress')
  async resetStudentProgress(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.resetStudentProgress(id);
  }

  // ============ TEACHER MANAGEMENT ============
  @Get('teachers')
  async getAllTeachers() {
    const teachers = await this.adminService.getAllTeachers();
    return {
      success: true,
      teachers,
      count: teachers.length,
    };
  }

  @Get('teachers/:id')
  async getTeacherById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getTeacherById(id);
  }

  @Post('teachers')
  async createTeacher(@Body() createTeacherDto: any) {
    return this.adminService.createTeacher(createTeacherDto);
  }

  @Put('teachers/:id')
  async updateTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: any,
  ) {
    return this.adminService.updateTeacher(id, updateTeacherDto);
  }

  @Delete('teachers/:id')
  async deleteTeacher(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteTeacher(id);
  }

  // ============ STATISTICS ============
  @Get('stats')
  async getStats() {
    const stats = await this.adminService.getAdminStats();
    return {
      success: true,
      stats: {
        total_students: stats.totalStudents,
        total_teachers: stats.totalTeachers,
        total_admins: 1, // Hardcoded for now
        verified_teachers: stats.totalTeachers, // All teachers are verified for now
        pending_teachers: 0,
      },
    };
  }

  // ============ GAME MANAGEMENT ============
  @Get('games')
  async getAllGames() {
    return this.adminService.getAllGames();
  }

  @Get('games/:id/students')
  async getGameStudents(@Param('id', ParseIntPipe) gameId: number) {
    return this.adminService.getStudentsByGame(gameId);
  }
}