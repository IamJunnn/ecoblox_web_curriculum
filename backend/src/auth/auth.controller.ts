import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, StudentPinLoginDto } from './dto/login.dto';
import { SetupPasswordDto } from './dto/setup-password.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('student-login')
  async studentLogin(@Body() studentPinLoginDto: StudentPinLoginDto) {
    return this.authService.studentLogin(studentPinLoginDto);
  }

  @Post('setup-password')
  async setupPassword(@Body() setupPasswordDto: SetupPasswordDto) {
    return this.authService.setupPassword(
      setupPasswordDto.token,
      setupPasswordDto.password,
    );
  }
}
