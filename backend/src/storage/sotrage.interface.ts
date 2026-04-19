export interface StorageProvider {
  upload(
    key: string,
    file: Buffer,
    contentType?: string,
  ): Promise<string>;

  get(key: string): Promise<NodeJS.ReadableStream>;

  delete(key: string): Promise<void>;
}