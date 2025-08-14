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
import { buildOpenApiDocumentation } from './open-api-docs';
import { ConfigService } from '@nestjs/config';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalFilters(
    new NotFoundInDatabaseExceptionFilter(),
    new NotFoundExceptionFilter(),
    new ValueErrorFilter(),
  );

  // Single JSON body parser selector based on precise integration route match
  const integrationRouteRegex = /^\/organizations\/[^/]+\/integration(?:\/?|$)/;
  const defaultJsonLimit =
    configService.get<string>('JSON_LIMIT_DEFAULT') || '10mb';
  const integrationJsonLimit =
    configService.get<string>('JSON_LIMIT_INTEGRATION') || '50mb';

  app.use((req, res, next) => {
    const limit = integrationRouteRegex.test(req.path)
      ? integrationJsonLimit
      : defaultJsonLimit;
    return json({ limit })(req, res, next);
  });

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
