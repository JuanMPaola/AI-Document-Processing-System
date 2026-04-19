import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Process } from '../../process/entities/process.entity';

export enum DocumentStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

@Entity({ name: 'documents' })
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  processId!: string;

  @ManyToOne(() => Process, (process) => process.documents, {
    onDelete: 'CASCADE',
  })
  process!: Process;

  @Column({ type: 'varchar', length: 255 })
  originalName!: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType!: string;

  @Column({ type: 'bigint' })
  size!: number;

  @Column({ type: 'text' })
  storageKey!: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.UPLOADED,
  })
  status!: DocumentStatus;

  @CreateDateColumn()
  createdAt!: Date;
}