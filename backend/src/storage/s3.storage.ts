import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { StorageProvider } from './sotrage.interface'
import * as dotenv from 'dotenv';
dotenv.config();

export class S3Storage implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_SECRET_KEY!,
      },
    });

    this.bucket = process.env.R2_BUCKET!;
  }

  async upload(key: string, file: Buffer, contentType?: string) {
    
    console.log(process.env.R2_BUCKET);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      }),
    );

    return key;
  }

  async get(key: string) {
    const res = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    return res.Body as NodeJS.ReadableStream;
  }

  async delete(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}