import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import {
  NotFoundExceptionFilter,
  NotFoundInDatabaseExceptionFilter,
  ValueErrorFilter,
} from './exceptions/exception.handler';
import { ValidationPipe } from '@nestjs/common';
import { MigrationV100ToV101Service } from './product-data-model-draft/migration-v-1-0-0-to-v-1-0-1.service';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // TODO: Delete after running migration service
  const migrationService = app.get(MigrationV100ToV101Service);
  await migrationService.migrateDrafts();
  await migrationService.migrateDataModels();
  app.useGlobalFilters(
    new NotFoundInDatabaseExceptionFilter(),
    new NotFoundExceptionFilter(),
    new ValueErrorFilter(),
  );
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
  });
  await app.listen(3000, '0.0.0.0');
}

if (require.main === module) {
  bootstrap();
}
