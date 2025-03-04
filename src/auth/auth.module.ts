import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
  imports: [UsersModule, PermissionsModule],
  providers: [],
  exports: [],
})
export class AuthModule {}
