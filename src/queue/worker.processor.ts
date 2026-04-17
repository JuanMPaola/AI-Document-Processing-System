import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { JOB_TYPES } from './queue.constants';
import { DocumentService } from '../document/document.service';
import { ProcessService } from '../process/process.service';

@Injectable()
export class WorkerProcessor implements OnModuleInit {
 // private worker: Worker;

  constructor(
/*     @Inject('REDIS_CONNECTION')
    private readonly connection: IORedis,
    private readonly documentService: DocumentService,
    private readonly processService: ProcessService, */
  ) {}

  onModuleInit() {
    /* this.worker = new Worker(
      'document-processing',
      async (job) => {
        if (job.name === JOB_TYPES.PROCESS_DOCUMENTS) {
          const { processId } = job.data;

          await this.processService.markAsRunning(processId);

          const docs = await this.documentService.findByProcess(processId);

          for (const doc of docs) {
            await this.documentService.markAsProcessing(doc.id);

            // 🔥 acá después metemos el análisis real
            console.log(`Processing doc ${doc.id}`);

            await this.documentService.markAsDone(doc.id);
          }

          await this.processService.markAsCompleted(processId);
        }
      },
      {
        connection: this.connection,
        concurrency: 3, // 🔥 clave para el challenge
      },
    ); */
  }
}