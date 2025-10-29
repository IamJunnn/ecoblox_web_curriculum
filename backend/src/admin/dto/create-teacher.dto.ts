import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTeacherDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  class_code?: string;
}
