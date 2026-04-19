import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Process, ProcessStatus } from './entities/process.entity';
import { DocumentService } from '../document/document.service';
import { AnalysisService } from '../analysis/analysis.service';
import { DocumentStatus } from '../document/entities/document.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ProcessService {
  constructor(
    @InjectRepository(Process)
    private readonly repo: Repository<Process>,
    private readonly documentService: DocumentService,
    private readonly analysisService: AnalysisService,
    private readonly storage: StorageService,
  ) { }

  async create() {
    const process = this.repo.create({
      status: ProcessStatus.PENDING,
    });

    return await this.repo.save(process);
  }

  async findAll() {
    return await this.repo.find({
      relations: ['documents'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const process = await this.repo.findOne({
      where: { id },
      relations: ['documents'],
    });

    if (!process) {
      throw new NotFoundException('Process not found');
    }

    return process;
  }

  async remove(id: string) {
    const process = await this.repo.findOne({
      where: { id },
      relations: ['documents'],
    });

    if (!process) {
      throw new NotFoundException('Process not found');
    }

    // borrar archivos en storage
    for (const doc of process.documents ?? []) {
      await this.storage.deleteFile(doc.storageKey).catch(() => null);
    }

    await this.repo.remove(process);

    return { deleted: true };
  }

  async updateStatus(id: string, status: ProcessStatus) {
    const process = await this.findOne(id);
    process.status = status;
    return await this.repo.save(process);
  }

  async markAsRunning(id: string) {
    return this.updateStatus(id, ProcessStatus.RUNNING);
  }

  async markAsCompleted(id: string) {
    return this.updateStatus(id, ProcessStatus.COMPLETED);
  }

  async uploadFiles(id: string, files: Express.Multer.File[]) {
    await this.findOne(id);
    return this.documentService.uploadMany(id, files);
  }

  async removeDocument(id: string, documentId: string) {
    await this.findOne(id);
    return this.documentService.removeFromProcess(id, documentId);
  }

  async start(id: string) {
    await this.findOne(id);
    return this.analysisService.start(id);
  }

  async pause(id: string) {
    await this.findOne(id);
    return this.analysisService.pause(id);
  }

  async resume(id: string) {
    await this.findOne(id);
    return this.analysisService.resume(id);
  }

  async stop(id: string) {
    await this.findOne(id);
    return this.analysisService.stop(id);
  }

  async getStatus(id: string) {
    const process = await this.findOne(id);

    const documents = process.documents ?? [];

    const totalFiles = documents.length;
    const processedFiles = documents.filter(
      (doc) => doc.status === DocumentStatus.DONE,
    ).length;

    const percentage =
      totalFiles === 0 ? 0 : Math.round((processedFiles / totalFiles) * 100);

    return {
      process_id: process.id,
      status: process.status,
      progress: {
        total_files: totalFiles,
        processed_files: processedFiles,
        percentage,
      },
      started_at: process.createdAt,
      estimated_completion: null,
    };
  }

  async getResults(id: string) {
    await this.findOne(id);
    return this.analysisService.getResults(id);
  }
}