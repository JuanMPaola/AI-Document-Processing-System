import { TextExtractor } from '../interfaces/text-extractor.interface';

export class TxtExtractor implements TextExtractor {
  supports(mimeType: string): boolean {
    return mimeType === 'text/plain';
  }

  async extract(buffer: Buffer): Promise<string> {
    return buffer.toString('utf-8');
  }
}