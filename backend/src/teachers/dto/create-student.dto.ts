import { IsString, IsEmail, IsOptional, Length } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(4, 4)
  pin_code?: string;
}
