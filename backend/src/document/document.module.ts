import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentService } from './document.service';

import { Document } from './entities/document.entity';
import { Process } from '../process/entities/process.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Process]),
    StorageModule,
  ],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}