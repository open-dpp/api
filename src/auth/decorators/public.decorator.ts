import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';

export const Public = (...args: string[]) => SetMetadata(IS_PUBLIC, args);

// For internal communication between microservices where no jwt token is available
export const ALLOW_SERVICE_ACCESS = 'allowServiceAccess';

export const AllowServiceAccess = (...args: string[]) =>
  SetMetadata(ALLOW_SERVICE_ACCESS, args);
