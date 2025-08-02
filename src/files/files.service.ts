import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService implements OnApplicationBootstrap {
  private client: Minio.Client;
  private bucketName;

  constructor(private readonly configService: ConfigService) {
    this.client = new Minio.Client({
      endPoint: configService.get<string>('S3_ENDPOINT'),
      useSSL: true,
      accessKey: configService.get<string>('S3_ACCESS_KEY'),
      secretKey: configService.get<string>('S3_SECRET_KEY'),
      region: 'nbg1',
    });
    this.bucketName = configService.get<string>('S3_BUCKET_NAME');
  }

  async onApplicationBootstrap() {
    await this.uploadFile('CLAUDE.md');
  }

  async uploadFile(filename: string) {
    const bucketExists = await this.client.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.client.makeBucket(this.bucketName);
    }
    const metadata = {
      'Content-Type': 'text/plain',
    };
    await this.client.fPutObject(this.bucketName, filename, filename, metadata);
  }

  async uploadProfilePicture(filename: string, userId: string) {
    const bucketExists = await this.client.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.client.makeBucket(this.bucketName);
    }
    const fileType = filename.split('.').pop();
    const objectName = `${userId}.${fileType}`;
    const response = await this.client.fPutObject(
      this.bucketName,
      objectName,
      filename,
    );
    console.log(response);
  }
}
