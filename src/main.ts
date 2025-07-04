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
  app.use((req, res, next) =>
    req.path.startsWith('/organizations/') && req.path.includes('/integration')
      ? next()
      : json({ limit: '100kb' })(req, res, next),
  );

  // Dedicated large-payload parser
  app.use(
    '/organizations/:organizationId/integration',
    json({ limit: '50mb' }),
  );
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
