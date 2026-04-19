import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { streamToBuffer } from './utils/stream-to-buffer.util';

import { TextExtractor } from './interfaces/text-extractor.interface';
import { PdfExtractor } from './extractors/pdf.extractor';
import { TxtExtractor } from './extractors/txt.extractor';
import { DocxExtractor } from './extractors/docx.extractor';
import { XlsxExtractor } from './extractors/xlsx.extractor';
import { ImageOcrExtractor } from './extractors/image-ocr.extractor';

@Injectable()
export class TextExtractionService {
  private extractors: TextExtractor[];

  constructor(private readonly storage: StorageService) {
    this.extractors = [
      new PdfExtractor(),
      new TxtExtractor(),
      new DocxExtractor(),
     // new XlsxExtractor(),
      new ImageOcrExtractor(),
    ];
  }

  async extractFromDocument(storageKey: string, mimeType: string) {
    const stream = await this.storage.getFile(storageKey);
    const buffer = await streamToBuffer(stream);

    const extractor = this.extractors.find((e) => e.supports(mimeType));

    if (!extractor) {
      throw new UnsupportedMediaTypeException(
        `Unsupported file type: ${mimeType}`,
      );
    }

    const text = await extractor.extract(buffer);

    return text;
  }
}