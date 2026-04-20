import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AiProvider } from '../interfaces/ai-provider.interface';
import Groq from 'groq-sdk';

@Injectable()
export class GroqProvider implements AiProvider {
  private readonly client: Groq;
  private readonly model = 'llama-3.1-8b-instant';
  private readonly maxRetries = 3;

  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async summarize(text: string): Promise<string> {
    let attempt = 0;

    while (attempt < this.maxRetries) {
      try {
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

      } catch (error: any) {
        const is429 =
          error?.status === 429 ||
          error?.message?.includes('rate_limit_exceeded');

        if (is429 && attempt < this.maxRetries - 1) {
          const waitSeconds =
            this.parseWaitTime(error?.message) ?? 10 * (attempt + 1);
          await new Promise((resolve) =>
            setTimeout(resolve, waitSeconds * 1000),
          );
          attempt++;
          continue;
        }

        throw new InternalServerErrorException(
          error?.message ?? 'Groq request failed',
        );
      }
    }

    throw new InternalServerErrorException('Groq max retries exceeded');
  }

  private parseWaitTime(message: string): number | null {
    const match = message?.match(/try again in (\d+(\.\d+)?)s/);
    return match ? Math.ceil(parseFloat(match[1])) + 1 : null;
  }
}