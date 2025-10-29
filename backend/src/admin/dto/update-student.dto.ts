import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(4, 4, { message: 'PIN must be exactly 4 characters' })
  @Matches(/^\d{4}$/, { message: 'PIN must be 4 digits' })
  pin_code?: string;
}
