import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AiProvider } from '../interfaces/ai-provider.interface';

@Injectable()
export class OllamaProvider implements AiProvider {
  private readonly baseUrl = 'http://localhost:11434';
  private readonly model = 'phi3:latest';

  async summarize(text: string): Promise<string> {
    const prompt = `
You are a document analysis assistant.

Summarize the following document in a concise way.
Return plain text only.
If the text is noisy, incomplete, or unclear, mention that briefly.

DOCUMENT:
${text}
    `.trim();

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new InternalServerErrorException('Ollama request failed');
    }

    const data = await response.json();
    return data.response?.trim() || '';
  }
}