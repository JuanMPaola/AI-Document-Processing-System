import { Module } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { WorkerProcessor } from './worker.processor';

@Module({
  providers: [ProducerService, WorkerProcessor],
  exports: [ProducerService],
})
export class QueueModule {}