import { Module } from '@nestjs/common';
import { UsersService } from './infrastructure/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/user.entity';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), OrganizationsModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
