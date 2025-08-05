import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';
import { join } from 'lodash';

enum BucketDefaultPaths {
  PRODUCT_PASSPORT_FILES = 'product-passport-files',
}

@Injectable()
export class FilesService {
  private client: Minio.Client;
  private readonly bucketNameDefault: string;
  private readonly bucketNameProfilePictures: string;
  private readonly pathDelimiter = '/';

  constructor(private readonly configService: ConfigService) {
    this.client = new Minio.Client({
      endPoint: configService.get<string>('S3_ENDPOINT'),
      useSSL: true,
      accessKey: configService.get<string>('S3_ACCESS_KEY'),
      secretKey: configService.get<string>('S3_SECRET_KEY'),
      region: 'nbg1',
    });
    this.bucketNameDefault = configService.get<string>(
      'S3_BUCKET_NAME_DEFAULT',
    );
    this.bucketNameProfilePictures = configService.get<string>(
      'S3_BUCKET_NAME_PROFILE_PICTURES',
    );
  }

  getFileExtension(localFilename: string) {
    return localFilename.split('.').pop();
  }

  buildBucketPath(
    bucketName: string,
    objectName: string,
    remoteFolders: string[] = [],
  ) {
    // const fileExtension = this.getFileExtension(localFilename);
    const fileExtension = 'webp';
    const path = join(
      [bucketName, ...remoteFolders, objectName],
      this.pathDelimiter,
    );
    return `${path}.${fileExtension}`;
  }

  async uploadFile(
    bucketName: string,
    buffer: Buffer,
    remoteFileBaseName: string,
    remoteFolders: string[] = [],
  ) {
    const bucketExists = await this.client.bucketExists(bucketName);
    if (!bucketExists) {
      throw new Error('Bucket does not exist');
    }
    const objectName = this.buildBucketPath(
      bucketName,
      remoteFileBaseName,
      remoteFolders,
    );
    return await this.client.putObject(bucketName, objectName, buffer);
  }

  async uploadProfilePicture(buffer: Buffer, userId: string) {
    // TODO: set profile picture for user
    await this.uploadFile(this.bucketNameProfilePictures, buffer, userId);
  }

  async uploadFileOfProductPassport(
    buffer: Buffer,
    dataFieldId: string,
    uniqueProductIdentifier: string,
  ) {
    // TODO: set profile picture for user
    await this.uploadFile(this.bucketNameProfilePictures, buffer, dataFieldId, [
      BucketDefaultPaths.PRODUCT_PASSPORT_FILES,
      uniqueProductIdentifier,
    ]);
  }
}
