import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';

import { Process } from './entities/process.entity';
import { Document } from '../document/entities/document.entity';
import { TextExtractionModule } from '../text-extraction/text-extraction.module';
import { DocumentModule } from '../document/document.module';
import { AiModule } from '../ai/ai.module';
import { AnalysisModule } from '../analysis/analysis.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Process, Document]),
    TextExtractionModule,
    DocumentModule,
    AiModule,
    AnalysisModule,
    StorageModule
  ],
  controllers: [ProcessController],
  providers: [ProcessService],
  exports: [ProcessService],
})
export class ProcessModule {}