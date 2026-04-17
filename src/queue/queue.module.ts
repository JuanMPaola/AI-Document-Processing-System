import { Module } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { ProducerService } from './producer.service';
import { WorkerProcessor } from './worker.processor';

@Module({
  providers: [
    {
      provide: 'REDIS_CONNECTION',
      useFactory: () => {
        return new IORedis({
          host: 'localhost',
          port: 6379,
        });
      },
    },
    {
      provide: 'DOCUMENT_QUEUE',
      useFactory: (connection: IORedis) => {
        return new Queue('document-processing', {
          connection,
        });
      },
      inject: ['REDIS_CONNECTION'],
    },
    ProducerService,
    WorkerProcessor,
  ],
  exports: ['DOCUMENT_QUEUE', ProducerService],
})
export class QueueModule {}