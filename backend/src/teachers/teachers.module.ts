import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { Student } from '../students/entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
