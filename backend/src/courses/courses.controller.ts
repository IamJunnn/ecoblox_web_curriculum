import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll() {
    const courses = await this.coursesService.findAll();
    return { courses };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const course = await this.coursesService.findOne(+id);
    return { course };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() courseData: Partial<Course>) {
    const course = await this.coursesService.create(courseData);
    return { success: true, course };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() courseData: Partial<Course>) {
    const course = await this.coursesService.update(+id, courseData);
    return { success: true, course };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.coursesService.remove(+id);
    return { success: true, message: 'Course deleted successfully' };
  }
}
