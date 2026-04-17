import { TextExtractor } from '../interfaces/text-extractor.interface';
const pdfParse = require('pdf-parse');

export class PdfExtractor implements TextExtractor {
  supports(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  async extract(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return data.text;
  }
}