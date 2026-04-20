import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { ModuleRef } from '@nestjs/core';
import { ANALYSIS_QUEUE, ANALYSIS_JOB_NAMES } from './queue.constants';
import { AnalysisService } from '../analysis/analysis.service';

@Injectable()
export class WorkerProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkerProcessor.name);
  private readonly connection: IORedis;
  private worker!: Worker;

  constructor(private readonly moduleRef: ModuleRef) {
    this.connection = new IORedis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
    });
  }

  onModuleInit() {
    this.worker = new Worker(
      ANALYSIS_QUEUE,
      async (job) => {
        if (job.name === ANALYSIS_JOB_NAMES.START_PROCESS_ANALYSIS) {
          const { processId } = job.data as { processId: string };

          const analysisService = this.moduleRef.get(AnalysisService, {
            strict: false,
          });

          this.logger.log(`Processing analysis for process ${processId}`);

          await analysisService.executeAnalysis(processId);
        }
      },
      {
        connection: this.connection,
        concurrency: 2,
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.connection.quit();
  }
}