import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeachersController } from './teachers.controller';
import { TeacherService } from './teacher.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeacherController, TeachersController],
  providers: [TeacherService],
  exports: [TeacherService]
})
export class TeacherModule {}
