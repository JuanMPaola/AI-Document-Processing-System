import {
  Controller,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

import { DocumentService } from './document.service';

@ApiTags('documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post(':processId/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a document to a process' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'processId',
    description: 'Process ID',
    example: 'uuid-here',
  })
  @ApiBody({
    description: 'File upload',
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  uploadDocument(
    @Param('processId') processId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentService.upload(processId, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({
    name: 'id',
    description: 'Document ID',
    example: 'uuid-here',
  })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}