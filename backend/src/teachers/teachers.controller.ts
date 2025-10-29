import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('api/teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post('students')
  async createStudent(
    @CurrentUser() user: any,
    @Body() createStudentDto: CreateStudentDto,
  ) {
    return this.teachersService.createStudent(user.id, createStudentDto);
  }

  @Get('students')
  async getStudents(@CurrentUser() user: any) {
    return this.teachersService.getTeacherStudents(user.id);
  }

  @Get('stats')
  async getStats(@CurrentUser() user: any) {
    return this.teachersService.getTeacherStats(user.id);
  }
}
