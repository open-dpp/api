import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PermissionsModule } from './permissions/permissions.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    PermissionsModule,
    JwtModule.register({
      global: true,
    }),
  ],
  providers: [],
  exports: [],
})
export class AuthModule {}
