export interface TextExtractor {
  supports(mimeType: string): boolean;
  extract(buffer: Buffer): Promise<string>;
}