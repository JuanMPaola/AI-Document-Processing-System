import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Document } from '../../document/entities/document.entity';

export enum ProcessStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED'
}

@Entity({ name: 'processes' })
export class Process {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: ProcessStatus,
    default: ProcessStatus.PENDING,
  })
  status!: ProcessStatus;

  @OneToMany(() => Document, (doc) => doc.process)
  documents!: Document[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}