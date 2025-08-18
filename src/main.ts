import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import {
  NotFoundExceptionFilter,
  NotFoundInDatabaseExceptionFilter,
  ValueErrorFilter,
} from './exceptions/exception.handler';
import { ValidationPipe } from '@nestjs/common';
import { buildOpenApiDocumentation } from './open-api-docs';
import { ConfigService } from '@nestjs/config';
import { applyBodySizeHandler } from './BodySizeHandler';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalFilters(
    new NotFoundInDatabaseExceptionFilter(),
    new NotFoundExceptionFilter(),
    new ValueErrorFilter(),
  );

  applyBodySizeHandler(app);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
  });
  if (configService.get<string>('BUILD_OPEN_API_DOCUMENTATION') === 'true') {
    buildOpenApiDocumentation(app);
  }

  await app.listen(3000, '0.0.0.0');
}

if (require.main === module) {
  bootstrap();
}
