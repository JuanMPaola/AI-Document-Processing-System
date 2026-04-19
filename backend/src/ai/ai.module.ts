import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { OllamaProvider } from './provider/ollama.provider';

@Module({
  providers: [AiService, OllamaProvider],
  exports: [AiService],
})
export class AiModule {}