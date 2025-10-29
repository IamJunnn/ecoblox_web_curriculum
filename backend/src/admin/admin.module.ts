import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity';
import { ProgressEvent } from '../progress/entities/progress-event.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Student, ProgressEvent]), EmailModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [TypeOrmModule, AdminService],
})
export class AdminModule {}
