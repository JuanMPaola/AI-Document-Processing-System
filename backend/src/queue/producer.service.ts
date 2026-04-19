import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { ANALYSIS_JOB_NAMES, ANALYSIS_QUEUE } from './queue.constants';

@Injectable()
export class ProducerService implements OnModuleDestroy {
  private readonly connection: IORedis;
  private readonly queue: Queue;

  constructor() {
    this.connection = new IORedis({
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

    this.queue = new Queue(ANALYSIS_QUEUE, {
      connection: this.connection,
    });
  }

  async enqueueProcessAnalysis(processId: string) {
    const job = await this.queue.add(
      ANALYSIS_JOB_NAMES.START_PROCESS_ANALYSIS,
      { processId },
      {
        attempts: 2,
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    );

    return {
      queued: true,
      processId,
      jobId: job.id,
    };
  }

  async onModuleDestroy() {
    await this.queue.close();
    await this.connection.quit();
  }
}