import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from '../public/public.decorator';
import { AuthRequest, KeycloakPermission } from '../auth-request';
import { HAS_PERMISSION } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC,
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const permissions =
      this.reflector.get<KeycloakPermission[]>(
        HAS_PERMISSION,
        context.getHandler(),
      ) || [];
    console.log(request.url, permissions);
    return true;
  }
}
