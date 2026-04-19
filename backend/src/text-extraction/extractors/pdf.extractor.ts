import { TextExtractor } from '../interfaces/text-extractor.interface';
import { PDFParse } from 'pdf-parse';

export class PdfExtractor implements TextExtractor {
  supports(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  async extract(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    return result.text;
  }
}