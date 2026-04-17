import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { OllamaProvider } from './provider/ollama.provider';
import { AiController } from './ai.controller';

@Module({
  providers: [AiService, OllamaProvider],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}