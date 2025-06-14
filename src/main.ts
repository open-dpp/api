import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import {
  NotFoundExceptionFilter,
  NotFoundInDatabaseExceptionFilter,
  ValueErrorFilter,
} from './exceptions/exception.handler';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(
    new NotFoundInDatabaseExceptionFilter(),
    new NotFoundExceptionFilter(),
    new ValueErrorFilter(),
  );
  app.use(
    '/organizations/:organizationId/integration',
    json({ limit: '50mb' }),
  );
  app.use(json({ limit: '100kb' }));
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
  });

  await app.listen(3000, '0.0.0.0');
}

if (require.main === module) {
  bootstrap();
}
