import { TextExtractor } from '../interfaces/text-extractor.interface';
import { createWorker } from 'tesseract.js';

export class ImageOcrExtractor implements TextExtractor {
  supports(mimeType: string): boolean {
    return [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/bmp',
      'image/tiff',
    ].includes(mimeType);
  }

  async extract(buffer: Buffer): Promise<string> {
    const worker = await createWorker('eng');

    try {
      const result = await worker.recognize(buffer);
      return result.data.text?.trim() ?? '';
    } finally {
      await worker.terminate();
    }
  }
}