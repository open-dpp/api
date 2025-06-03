import { Controller, Get, Request } from '@nestjs/common';
import { UsersService } from '../infrastructure/users.service';
import { AuthRequest } from 'src/auth/auth-request';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/profile')
  async findOne(@Request() req: AuthRequest) {
    const keycloakUser = req.authContext.keycloakUser;
    return {
      email: keycloakUser.email,
      name: keycloakUser.name,
    };
  }
}
