import { Injectable } from '@nestjs/common';
import { StorageProvider } from './sotrage.interface';
import { S3Storage } from './s3.storage';

@Injectable()
export class StorageService {
  private provider: StorageProvider;

  constructor() {
    // después podés inyectar según env (R2, MinIO, etc.)
    this.provider = new S3Storage();
  }

  uploadFile(
    key: string,
    file: Buffer,
    contentType?: string,
  ) {
    return this.provider.upload(key, file, contentType);
  }

  getFile(key: string) {
    return this.provider.get(key);
  }

  deleteFile(key: string) {
    return this.provider.delete(key);
  }
}