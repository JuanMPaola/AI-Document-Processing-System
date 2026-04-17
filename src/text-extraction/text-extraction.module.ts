import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { TextExtractionService } from './text-extraction.service';

@Module({
  imports: [StorageModule],
  providers: [TextExtractionService],
  exports: [TextExtractionService],
})
export class TextExtractionModule {}