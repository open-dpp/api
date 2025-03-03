import { EntityNotFoundError } from 'typeorm';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { OrganizationEntity } from '../organizations/infrastructure/organization.entity';

@Catch(EntityNotFoundError)
export class EntityNotFoundErrorFilter implements ExceptionFilter {
  catch(exception: EntityNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception.entityClass === OrganizationEntity
        ? HttpStatus.FORBIDDEN
        : HttpStatus.NOT_FOUND;
    const message =
      exception.entityClass === OrganizationEntity
        ? undefined
        : exception.message;
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
