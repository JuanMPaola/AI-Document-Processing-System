import { Inject, Injectable } from '@nestjs/common';
import type { AiProvider } from './interfaces/ai-provider.interface';

@Injectable()
export class AiService {
  constructor(@Inject('AI_PROVIDER') private readonly provider: AiProvider) { }

  async summarize(text: string): Promise<string> {
    return this.provider.summarize(text);
  }
}