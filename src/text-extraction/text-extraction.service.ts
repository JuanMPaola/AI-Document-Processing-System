import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { streamToBuffer } from './utils/stream-to-buffer.util';

import { TextExtractor } from './interfaces/text-extractor.interface';
import { PdfExtractor } from './extractors/pdf.extractor';
import { TxtExtractor } from './extractors/txt.extractor';

@Injectable()
export class TextExtractionService {
  private extractors: TextExtractor[];

  constructor(private readonly storage: StorageService) {
    this.extractors = [
      new PdfExtractor(),
      new TxtExtractor(),
    ];
  }

  async extractFromDocument(storageKey: string, mimeType: string) {
    // 1. descargar archivo desde R2
    const stream = await this.storage.getFile(storageKey);

    // 2. convertir a buffer
    const buffer = await streamToBuffer(stream);

    // 3. elegir extractor
    const extractor = this.extractors.find((e) =>
      e.supports(mimeType),
    );

    if (!extractor) {
      throw new UnsupportedMediaTypeException(
        `Unsupported file type: ${mimeType}`,
      );
    }

    // 4. extraer texto
    const text = await extractor.extract(buffer);

    return text;
  }
}