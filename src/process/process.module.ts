import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';

import { Process } from './entities/process.entity';
import { Document } from '../document/entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Process, Document]),
  ],
  controllers: [ProcessController],
  providers: [ProcessService],
  exports: [ProcessService],
})
export class ProcessModule {}