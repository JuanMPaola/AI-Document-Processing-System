import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { OllamaProvider } from './provider/ollama.provider';
import { GroqProvider } from './provider/groq.provider';
import { AiProvider } from './interfaces/ai-provider.interface';

const aiProviderFactory = {
  provide: 'AI_PROVIDER',
  useFactory: () => {
    const provider = process.env.AI_PROVIDER || 'ollama';
    return provider === 'groq' ? new GroqProvider() : new OllamaProvider();
  },
};

@Module({
  providers: [
    aiProviderFactory,
    {
      provide: AiService,
      useFactory: (provider: AiProvider) => new AiService(provider),
      inject: ['AI_PROVIDER'],
    },
  ],
  exports: [AiService],
})
export class AiModule {}