import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Document, DocumentStatus } from './entities/document.entity';
import { StorageService } from '../storage/storage.service';
import { Process } from '../process/entities/process.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly repo: Repository<Document>,

    @InjectRepository(Process)
    private readonly processRepo: Repository<Process>,

    private readonly storage: StorageService,
  ) { }

  async upload(processId: string, file: Express.Multer.File) {
    const process = await this.processRepo.findOne({
      where: { id: processId },
    });

    if (!process) {
      throw new NotFoundException('Process not found');
    }

    const key = `process/${processId}/${Date.now()}-${file.originalname}`;

    try {
      await this.storage.uploadFile(key, file.buffer, file.mimetype);

      const doc = this.repo.create({
        processId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storageKey: key,
        status: DocumentStatus.UPLOADED,
      });

      return await this.repo.save(doc);
    } catch (error) {
      await this.storage.deleteFile(key).catch(() => null);
      throw error;
    }
  }

  async uploadMany(processId: string, files: Express.Multer.File[]) {
    if (!files?.length) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadedDocuments: Document[] = [];

    for (const file of files) {
      const document = await this.upload(processId, file);
      uploadedDocuments.push(document);
    }

    return {
      processId,
      uploadedCount: uploadedDocuments.length,
      documents: uploadedDocuments,
    };
  }

  async findByProcess(processId: string) {
    return await this.repo.find({
      where: { processId },
      order: { createdAt: 'ASC' },
    });
  }

  async markAsProcessing(id: string) {
    const doc = await this.repo.findOne({
      where: { id },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    doc.status = DocumentStatus.PROCESSING;
    return await this.repo.save(doc);
  }

  async markAsDone(id: string) {
    const doc = await this.repo.findOne({
      where: { id },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    doc.status = DocumentStatus.DONE;
    return await this.repo.save(doc);
  }

  async remove(id: string) {
    const doc = await this.repo.findOne({
      where: { id },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    await this.storage.deleteFile(doc.storageKey);
    await this.repo.remove(doc);

    return { deleted: true };
  }

  async findById(id: string) {
    const doc = await this.repo.findOne({
      where: { id },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    return doc;
  }
}