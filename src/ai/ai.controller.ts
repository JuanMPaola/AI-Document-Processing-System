import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

@Post('summarize')
  @ApiOperation({
    summary: 'Generate a summary from input text',
    description:
      'Uses a local AI model (Ollama) to generate a concise summary of the provided text.',
  })
  @ApiBody({
    description: 'Text to be summarized',
    schema: {
      type: 'object',
      required: ['text'],
      properties: {
        text: {
          type: 'string',
          example:
            'REST APIs allow communication between systems using HTTP methods such as GET, POST, PUT, and DELETE.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Summary generated successfully',
    schema: {
      example: {
        summary:
          'REST APIs enable communication between systems using standard HTTP methods.',
      },
    },
  })
  async summarize(@Body('text') text: string) {
    const result = await this.aiService.summarize(text);

    return {
      summary: result,
    };
  }
}