import { TextExtractor } from '../interfaces/text-extractor.interface';
import * as ExcelJS from 'exceljs';

export class XlsxExtractor /* implements TextExtractor  */{
 /*  supports(mimeType: string): boolean {
    return (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel'
    );
  }

  async extract(buffer: Buffer): Promise<string> {
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.load(buffer as unknown as Buffer);

    const parts: string[] = [];

    workbook.worksheets.forEach((sheet) => {
      parts.push(`Sheet: ${sheet.name}`);

      sheet.eachRow((row) => {
        const values = row.values;

        if (Array.isArray(values)) {
          const rowText = values
            .slice(1)
            .map((cell) => {
              if (cell === null || cell === undefined) return '';
              if (typeof cell === 'object') {
                if ('text' in cell && typeof cell.text === 'string') {
                  return cell.text;
                }
                return JSON.stringify(cell);
              }
              return String(cell);
            })
            .filter((value) => value.trim().length > 0)
            .join(' | ');

          if (rowText) {
            parts.push(rowText);
          }
        }
      });

      parts.push('');
    });

    return parts.join('\n').trim();
  } */
}