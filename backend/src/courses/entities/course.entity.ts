import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProgressEvent } from '../../progress/entities/progress-event.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  total_levels: number;

  @Column({ nullable: true })
  url: string;

  @Column({ default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => ProgressEvent, (progress) => progress.course)
  progressEvents: ProgressEvent[];
}