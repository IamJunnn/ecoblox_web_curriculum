import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  class_code?: string;
}
