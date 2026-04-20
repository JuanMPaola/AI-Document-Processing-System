import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProcessService } from './process.service';

@ApiTags('process')
@Controller('process')
export class ProcessController {
  constructor(
    private readonly processService: ProcessService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new process' })
  @ApiResponse({
    status: 201,
    description: 'Process created successfully',
  })
  create() {
    return this.processService.create();
  }

  @Get()
  @ApiOperation({ summary: 'Get all processes' })
  @ApiResponse({
    status: 200,
    description: 'List of processes',
  })
  findAll() {
    return this.processService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get process details by id' })
  @ApiParam({
    name: 'id',
    description: 'Process ID',
    example: '027982a9-52e5-4e42-8d0c-1b3b3d4e9075',
  })
  @ApiResponse({
    status: 200,
    description: 'Process found successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Process not found',
  })
  findOne(@Param('id') id: string) {
    return this.processService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a process' })
  @ApiParam({
    name: 'id',
    description: 'Process ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Process deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Process not found',
  })
  remove(@Param('id') id: string) {
    return this.processService.remove(id);
  }

  @Post(':id/files')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Upload multiple documents to a process' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Process ID',
    example: '027982a9-52e5-4e42-8d0c-1b3b3d4e9075',
  })
  @ApiBody({
    description: 'Multiple file upload',
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Files uploaded successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Process not found',
  })
  uploadFiles(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.processService.uploadFiles(id, files);
  }

  @Delete(':id/files/:documentId')
  @ApiOperation({ summary: 'Delete a document from a process' })
  @ApiParam({
    name: 'id',
    description: 'Process ID',
    example: '027982a9-52e5-4e42-8d0c-1b3b3d4e9075',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    example: 'd53b6f65-8d4c-4715-9d55-2e66b4d9d730',
  })
  @ApiResponse({
    status: 200,
    description: 'Document deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Process or document not found',
  })
  removeDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
  ) {
    return this.processService.removeDocument(id, documentId);
  }



  @Post(':id/start')
  @ApiOperation({
    summary: 'Start analysis for a process',
    description:
      'Queues the analysis job for the given process. The actual processing is performed asynchronously by a worker.',
  })
  @ApiParam({
    name: 'id',
    description: 'Process ID',
    example: '9d4f756e-cc27-4db6-909d-75eb1ba573f7',
  })
  @ApiResponse({
    status: 201,
    description: 'Analysis job queued successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Process not found',
  })
  start(@Param('id') id: string) {
    return this.processService.start(id);
  }

  @Post(':id/pause')
  @ApiOperation({
    summary: 'Pause a running process',
    description:
      'Marks the process as PAUSED. The current document may finish, but the analysis will stop before processing the next one.',
  })
  @ApiParam({
    name: 'id',
    description: 'Process ID',
    example: '9d4f756e-cc27-4db6-909d-75eb1ba573f7',
  })
  @ApiResponse({
    status: 201,
    description: 'Pause requested successfully',
    schema: {
      example: {
        processId: '9d4f756e-cc27-4db6-909d-75eb1ba573f7',
        status: 'PAUSED',
        message: 'Pause requested successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Only running processes can be paused',
  })
  @ApiResponse({
    status: 404,
    description: 'Process not found',
  })
  pause(@Param('id') id: string) {
    return this.processService.pause(id);
  }

  @Post(':id/resume')
  @ApiOperation({
    summary: 'Resume a paused process',
    description:
      'Changes the process state and re-queues it so the worker can continue with the remaining documents.',
  })
  @ApiParam({
    name: 'id',
    description: 'Process ID',
    example: '9d4f756e-cc27-4db6-909d-75eb1ba573f7',
  })
  @ApiResponse({
    status: 201,
    description: 'Process resumed successfully',
    schema: {
      example: {
        processId: '9d4f756e-cc27-4db6-909d-75eb1ba573f7',
        status: 'PENDING',
        message: 'Process resumed and queued',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Only paused processes can be resumed',
  })
  @ApiResponse({
    status: 404,
    description: 'Process not found',
  })
  resume(@Param('id') id: string) {
    return this.processService.resume(id);
  }

  @Post(':id/stop')
  @ApiOperation({
    summary: 'Stop a process',
    description:
      'Marks the process as STOPPED. The current document may finish, but the worker will not continue with the remaining ones.',
  })
  @ApiParam({
    name: 'id',
    description: 'Process ID',
    example: '9d4f756e-cc27-4db6-909d-75eb1ba573f7',
  })
  @ApiResponse({
    status: 201,
    description: 'Stop requested successfully',
    schema: {
      example: {
        processId: '9d4f756e-cc27-4db6-909d-75eb1ba573f7',
        status: 'STOPPED',
        message: 'Stop requested successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'This process cannot be stopped in its current state',
  })
  @ApiResponse({
    status: 404,
    description: 'Process not found',
  })
  stop(@Param('id') id: string) {
    return this.processService.stop(id);
  }

  @Get(':id/status')
  @ApiOperation({
    summary: 'Get process status',
    description: 'Returns the current state and progress of a process.',
  })
  @ApiParam({
    name: 'id',
    description: 'Process ID',
    example: '9d4f756e-cc27-4db6-909d-75eb1ba573f7',
  })
  @ApiResponse({
    status: 200,
    description: 'Process status retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Process not found',
  })
  getStatus(@Param('id') id: string) {
    return this.processService.getStatus(id);
  }

  @Get(':id/results')
  @ApiOperation({
    summary: 'Get analysis results for a process',
  })
  @ApiParam({
    name: 'id',
    description: 'Process ID',
    example: '9d4f756e-cc27-4db6-909d-75eb1ba573f7',
  })
  @ApiResponse({
    status: 200,
    description: 'Analysis results retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Process not found',
  })
  getResults(@Param('id') id: string) {
    return this.processService.getResults(id);
  }
}