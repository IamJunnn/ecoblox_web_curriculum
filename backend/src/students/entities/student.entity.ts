import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { ProgressEvent } from '../../progress/entities/progress-event.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  password_hash: string;

  @Column({ nullable: true, length: 4 })
  pin_code: string;

  @Column({
    type: 'varchar',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ nullable: true })
  class_code: string;

  @Column({ nullable: true })
  created_by_teacher_id: number;

  @Column({ nullable: true })
  invitation_token: string;

  @Column({ default: false })
  is_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  last_active: Date;

  @OneToMany(() => ProgressEvent, (progress) => progress.student)
  progressEvents: ProgressEvent[];

  // Virtual fields for stats (not in database)
  badges?: number;
  progress_percentage?: number;
  total_xp?: number;
  quiz_score?: string;
}
