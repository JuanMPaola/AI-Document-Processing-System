import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'analysis_results' })
export class AnalysisResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  processId!: string;

  @Index()
  @Column({ type: 'uuid' })
  documentId!: string;

  @Column({ type: 'bigint', default: 0 })
  extractedTextLength!: number;

  @Column({ type: 'text', nullable: true })
  summary!: string;

  @Column({ type: 'bigint', default: 0 })
  totalWords!: number;

  @Column({ type: 'bigint', default: 0 })
  totalLines!: number;

  @Column({ type: 'bigint', default: 0 })
  totalCharacters!: number;

  @Column({ type: 'jsonb', nullable: true })
  mostFrequentWords!: { word: string; count: number }[];

  @CreateDateColumn()
  createdAt!: Date;
}