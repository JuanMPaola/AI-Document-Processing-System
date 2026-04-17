import { Module } from '@nestjs/common';
import { ProcessModule } from './process/process.module';
import { DocumentModule } from './document/document.module';
import { StorageModule } from './storage/storage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from './queue/queue.module';
import { AiModule } from './ai/ai.module';
import { TextExtractionModule } from './text-extraction/text-extraction.module';

@Module({
  imports: [
    ProcessModule, 
    DocumentModule, 
    StorageModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'doc_processing',

      autoLoadEntities: true,
      synchronize: true,

      logging: true,
    }),
    AiModule,
    TextExtractionModule,
    //QueueModule,
  ],
})
export class AppModule {}
