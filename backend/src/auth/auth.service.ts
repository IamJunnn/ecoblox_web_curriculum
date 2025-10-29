import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Student } from '../students/entities/student.entity';
import { LoginDto, StudentPinLoginDto } from './dto/login.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.studentsRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password_hash', 'role', 'class_code'],
    });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async validateStudentPin(email: string, pin: string): Promise<any> {
    const student = await this.studentsRepository.findOne({
      where: { email, pin_code: pin, role: UserRole.STUDENT },
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
    await this.studentsRepository.update(student.id, {
      last_active: new Date(),
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

  async generatePin(): Promise<string> {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const existingStudent = await this.studentsRepository.findOne({
      where: { pin_code: pin },
    });

    if (existingStudent) {
      return this.generatePin(); // Recursive call if PIN already exists
    }

    return pin;
  }

  async setupPassword(token: string, password: string) {
    // Find teacher with this invitation token
    const teacher = await this.studentsRepository.findOne({
      where: { invitation_token: token, role: UserRole.TEACHER },
    });

    if (!teacher) {
      throw new UnauthorizedException('Invalid or expired invitation token');
    }

    if (teacher.is_verified) {
      throw new UnauthorizedException(
        'This invitation has already been used',
      );
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // Update teacher: set password, verify account, clear token
    teacher.password_hash = password_hash;
    teacher.is_verified = true;
    teacher.invitation_token = '';
    await this.studentsRepository.save(teacher);

    // Return success with auto-login
    const payload = {
      sub: teacher.id,
      email: teacher.email,
      name: teacher.name,
      role: teacher.role,
      class_code: teacher.class_code,
    };

    return {
      success: true,
      message: 'Password set successfully. You are now logged in.',
      access_token: this.jwtService.sign(payload),
      user: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        class_code: teacher.class_code,
      },
    };
  }
}
