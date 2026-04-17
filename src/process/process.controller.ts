import { Controller, Get, Param, Post } from '@nestjs/common';
import { ProcessService } from './process.service';

@Controller('process')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post()
  create() {
    return this.processService.create();
  }

  @Get()
  findAll() {
    return this.processService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.processService.findOne(id);
  }
}