import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async getCourses(@Req() req: any) {
    // Get user ID from JWT token
    const userId = req.user?.userId || req.user?.id;

    // Return courses based on user's game enrollments
    return this.coursesService.getCourses(userId);
  }

  @Get(':id')
  async getCourse(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    // Get user ID from JWT token to check if course is locked
    const userId = req.user?.userId || req.user?.id;
    return this.coursesService.getCourse(id, userId);
  }
}
