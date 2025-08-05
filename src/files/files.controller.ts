import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { VirusScanFileValidator } from './virus-scan.file-validator';
import { AuthRequest } from '../auth/auth-request';
import sharp from 'sharp';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post(':userId/profileImage')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadProfileImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024 /* max 10MB */,
          }),
          new FileTypeValidator({
            fileType: /(image\/(jpeg|jpg|png|heic|webp))$/,
          }),
          new VirusScanFileValidator({ storageType: 'memory' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: AuthRequest,
  ): Promise<string> {
    const imageBuffer = file.buffer;
    const croppedImageBuffer = await sharp(imageBuffer)
      .resize({ width: 155, height: 155, fit: 'cover' })
      .webp({ quality: 85 })
      .toBuffer();

    const randomName = randomUUID();
    const newFileName = `${randomName}.webp`;
    /* writeFileSync(
      `${UPLOAD_PATH}/profileImages/${newFileName}`,
      croppedImageBuffer,
    ); */

    // await this.userSrv.setProfileImage(userId, newFileName, req.authContext);
    return newFileName;
  }

  @Post('upload-dpp-file/:upi')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadDppFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024 /* max 10MB */,
          }),
          new FileTypeValidator({
            fileType: /(image\/(jpeg|jpg|png|heic|webp))$/,
          }),
          new VirusScanFileValidator({ storageType: 'memory' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('upi') upi: string,
    @Req() req: AuthRequest,
  ): Promise<string> {
    const imageBuffer = file.buffer;
    const croppedImageBuffer = await sharp(imageBuffer)
      .resize({ width: 155, height: 155, fit: 'cover' })
      .webp({ quality: 85 })
      .toBuffer();

    const randomName = randomUUID();
    const newFileName = `${randomName}.webp`;
    /* writeFileSync(
      `${UPLOAD_PATH}/profileImages/${newFileName}`,
      croppedImageBuffer,
    ); */

    // await this.userSrv.setProfileImage(userId, newFileName, req.authContext);
    await this.filesService.uploadFileOfProductPassport(
      croppedImageBuffer,
      randomUUID(),
      upi,
    );
    return newFileName;
  }
}
