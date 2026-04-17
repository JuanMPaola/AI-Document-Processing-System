import { Injectable } from '@nestjs/common';
import { OllamaProvider } from './provider/ollama.provider';

@Injectable()
export class AiService {
  constructor(private readonly ollamaProvider: OllamaProvider) {}

  async summarize(text: string): Promise<string> {
    return this.ollamaProvider.summarize(text);
  }
}