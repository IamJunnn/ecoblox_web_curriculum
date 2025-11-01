import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateProgressDto {
  @IsNumber()
  student_id: number;

  @IsNumber()
  course_id: number;

  @IsString()
  event_type: string; // "step_checked", "course_started", "course_completed", "badge_earned"

  @IsOptional()
  @IsNumber()
  level?: number;

  @IsOptional()
  data?: any;
}
