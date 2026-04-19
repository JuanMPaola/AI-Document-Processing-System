import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalysisService } from './analysis.service';
import { AnalysisResult } from './entities/analysis-result.entity';
import { Process } from '../process/entities/process.entity';
import { DocumentModule } from '../document/document.module';
import { TextExtractionModule } from '../text-extraction/text-extraction.module';
import { AiModule } from '../ai/ai.module';
import { QueueModule } from '../queue/queue.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Process, AnalysisResult]),
    DocumentModule,
    TextExtractionModule,
    AiModule,
    QueueModule,
    RealtimeModule
  ],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}