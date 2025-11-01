import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, StudentPinLoginDto } from './dto/login.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.password_hash && (await bcrypt.compare(password, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async validateStudentPin(email: string, pin: string): Promise<any> {
    const student = await this.prisma.user.findFirst({
      where: {
        email,
        pin_code: pin,
        role: UserRole.STUDENT
      },
    });

    if (student) {
      return student;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify role if specified
    if (loginDto.role && user.role !== loginDto.role) {
      throw new UnauthorizedException(
        `This account is not registered as a ${loginDto.role}`,
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      class_code: user.class_code,
    };

    return {
      success: true,
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        class_code: user.class_code,
      },
    };
  }

  async studentLogin(studentPinLoginDto: StudentPinLoginDto) {
    const student = await this.validateStudentPin(
      studentPinLoginDto.email,
      studentPinLoginDto.pin,
    );

    if (!student) {
      throw new UnauthorizedException('Invalid email or PIN');
    }

    const payload = {
      sub: student.id,
      email: student.email,
      name: student.name,
      role: student.role,
      class_code: student.class_code,
    };

    // Update last active
    await this.prisma.user.update({
      where: { id: student.id },
      data: { last_active: new Date() },
    });

    return {
      success: true,
      access_token: this.jwtService.sign(payload),
      session: {
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        class_code: student.class_code,
      },
    };
  }

  async setupPassword(token: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        invitation_token: token,
        is_verified: false,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired invitation token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        is_verified: true,
        invitation_token: null,
      },
    });

    return {
      success: true,
      message: 'Password set successfully. You can now login.',
    };
  }
}