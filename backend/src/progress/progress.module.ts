import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { ProgressEvent } from './entities/progress-event.entity';
import { Student } from '../students/entities/student.entity';
import { Course } from '../courses/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProgressEvent, Student, Course])],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [TypeOrmModule, ProgressService]
})
export class ProgressModule {}
