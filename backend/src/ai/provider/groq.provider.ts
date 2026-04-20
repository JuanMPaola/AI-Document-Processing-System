import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AiProvider } from '../interfaces/ai-provider.interface';
import Groq from 'groq-sdk';

@Injectable()
export class GroqProvider implements AiProvider {
  private readonly client: Groq;
  private readonly model = 'llama-3.1-8b-instant';

  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async summarize(text: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'user',
          content: `You are a document analysis assistant.

Summarize the following document in a concise way.
Return plain text only.
If the text is noisy, incomplete, or unclear, mention that briefly.

DOCUMENT:
${text}`,
        },
      ],
    });

    const result = response.choices[0]?.message?.content?.trim();

    if (!result) {
      throw new InternalServerErrorException('Groq returned an empty response');
    }

    return result;
  }
}