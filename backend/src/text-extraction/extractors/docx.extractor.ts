import { TextExtractor } from '../interfaces/text-extractor.interface';
import * as mammoth from 'mammoth';

export class DocxExtractor implements TextExtractor {
  supports(mimeType: string): boolean {
    return (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    );
  }

  async extract(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value?.trim() ?? '';
  }
}