import { HttpService } from '@nestjs/axios';
import { FileValidator } from '@nestjs/common';
import FormData from 'form-data';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { firstValueFrom } from 'rxjs';

interface VirusScanValidatorOptions {
  storageType: 'disk' | 'memory';
}

export class VirusScanFileValidator extends FileValidator<VirusScanValidatorOptions> {
  private readonly httpService = new HttpService();

  async isValid(file?: Express.Multer.File): Promise<boolean> {
    try {
      const form = new FormData();

      if (!file) {
        return false;
      }

      const fileContent =
        this.validationOptions.storageType === 'disk'
          ? readFileSync(file.path)
          : file.buffer.toString();
      form.append('file', fileContent, file.originalname);

      try {
        const result = (
          await firstValueFrom(
            this.httpService.post('http://clamav-rest:9000/scan', form),
          )
        ).status;
        if (result === 200) {
          return true;
        }
      } catch (err: unknown) {
        if (
          typeof err === 'object' &&
          err !== null &&
          'syscall' in err &&
          err.syscall === 'getaddrinfo' &&
          process.env.NODE_ENV === 'LOCAL'
        ) {
          return true; // ignore if in LOCAL env and clamav is not available
        }
      }

      if (existsSync(file.path)) {
        unlinkSync(file.path); // delete a file when infected
      }
      return false;
    } catch {
      return false;
    }
  }

  buildErrorMessage(): string {
    return 'The file was denied by our virus scanning system.';
  }
}
