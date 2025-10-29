import { IsNumber, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateProgressDto {
  @IsNumber()
  student_id: number;

  @IsNumber()
  course_id: number;

  @IsString()
  event_type: string;

  @IsOptional()
  @IsNumber()
  level?: number;

  @IsOptional()
  @IsObject()
  data?: any;
}