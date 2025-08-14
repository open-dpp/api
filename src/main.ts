import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import {
  NotFoundExceptionFilter,
  NotFoundInDatabaseExceptionFilter,
  ValueErrorFilter,
} from './exceptions/exception.handler';
import { ValidationPipe } from '@nestjs/common';
import { json, NextFunction, Response } from 'express';
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
  const defaultJsonParser = json({ limit: defaultJsonLimit });
  const integrationJsonParser = json({ limit: integrationJsonLimit });
  app.use((req, res, next) => {
    const parser = integrationRouteRegex.test(req.path)
      ? integrationJsonParser
      : defaultJsonParser;
    return parser(req, res, next);
  });
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({
        statusCode: 413,
        message: 'Payload Too Large',
        error: 'PayloadTooLargeError',
      });
    }
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Invalid JSON payload',
        error: 'BadRequest',
      });
    }
    return next(err);
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
