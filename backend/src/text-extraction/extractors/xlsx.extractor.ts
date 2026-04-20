import { TextExtractor } from '../interfaces/text-extractor.interface';
import * as XLSX from 'xlsx';

export class XlsxExtractor implements TextExtractor {
  supports(mimeType: string): boolean {
    return (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel'
    );
  }

 async extract(buffer: Buffer): Promise<string> {
    const workbook = XLSX.read(buffer);
    const parts: string[] = [];

    workbook.SheetNames.forEach((name) => {
        parts.push(`Sheet: ${name}`);
        const sheet = workbook.Sheets[name];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        parts.push(csv);
        parts.push('');
    });

    return parts.join('\n').trim();
}
}