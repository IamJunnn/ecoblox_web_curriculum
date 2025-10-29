import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Course } from '../../courses/entities/course.entity';

export enum EventType {
  SESSION_START = 'session_start',
  STEP_CHECKED = 'step_checked',
  QUIZ_ANSWERED = 'quiz_answered',
  LEVEL_UNLOCKED = 'level_unlocked',
  QUEST_COMPLETED = 'quest_completed',
  COURSE_COMPLETED = 'course_completed',
}

@Entity('progress_events')
export class ProgressEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_id: number;

  @Column()
  course_id: number;

  @Column({
    type: 'varchar',
    enum: EventType,
  })
  event_type: EventType;

  @Column({ nullable: true })
  level: number;

  @Column({ type: 'text', nullable: true })
  data: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Student, (student) => student.progressEvents)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Course, (course) => course.progressEvents)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}