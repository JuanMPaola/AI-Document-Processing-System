import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Process, ProcessStatus } from '../process/entities/process.entity';

@Injectable()
export class ProcessService {
  constructor(
    @InjectRepository(Process)
    private readonly repo: Repository<Process>,
  ) {}

  async create() {
    const process = this.repo.create({
      status: ProcessStatus.PENDING,
    });

    return await this.repo.save(process);
  }

  async findAll() {
    return await this.repo.find({
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

  async updateStatus(id: string, status: ProcessStatus) {
    const process = await this.findOne(id);

    process.status = status;

    return await this.repo.save(process);
  }
}