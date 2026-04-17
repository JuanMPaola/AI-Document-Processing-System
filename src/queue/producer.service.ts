import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JOB_TYPES } from './queue.constants';

@Injectable()
export class ProducerService {
  constructor(
    @Inject('DOCUMENT_QUEUE')
    private readonly queue: Queue,
  ) {}

  async processDocuments(processId: string) {
    await this.queue.add(JOB_TYPES.PROCESS_DOCUMENTS, {
      processId,
    });
  }
}