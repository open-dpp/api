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
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ItemsModule } from './items/items.module';
import { ModelsModule } from './models/models.module';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  const config = new DocumentBuilder()
    .setTitle('open-dpp')
    .setDescription('API specification for open-dpp')
    .setVersion('1.0')
    .addTag('open-dpp')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      include: [ItemsModule, ModelsModule],
    });
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(3000, '0.0.0.0');
}

if (require.main === module) {
  bootstrap();
}
