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
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('teachers')
  async createTeacher(@Body() createTeacherDto: CreateTeacherDto) {
    return this.adminService.createTeacher(createTeacherDto);
  }

  @Get('teachers')
  async getAllTeachers() {
    return this.adminService.getAllTeachers();
  }

  @Get('teachers/:id')
  async getTeacherById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getTeacherById(id);
  }

  @Put('teachers/:id')
  async updateTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.adminService.updateTeacher(id, updateTeacherDto);
  }

  @Delete('teachers/:id')
  async deleteTeacher(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteTeacher(id);
  }

  @Get('stats')
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  // Student Management Endpoints
  @Post('students')
  async createStudent(@Body() createStudentDto: any) {
    return this.adminService.createStudent(createStudentDto);
  }

  @Get('students')
  async getAllStudents() {
    return this.adminService.getAllStudents();
  }

  @Get('students/:id')
  async getStudentById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getStudentById(id);
  }

  @Put('students/:id')
  async updateStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.adminService.updateStudent(id, updateStudentDto);
  }

  @Post('students/:id/generate-pin')
  async generateNewPin(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.generateNewPin(id);
  }

  @Post('students/:id/reset-progress')
  async resetStudentProgress(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.resetStudentProgress(id);
  }

  @Delete('students/:id')
  async deleteStudent(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteStudent(id);
  }
}
