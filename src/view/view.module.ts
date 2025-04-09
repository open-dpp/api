import { Module } from '@nestjs/common';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { getViewSchema, ViewDoc } from './infrastructure/view.schema';
import { ViewController } from './presentation/view.controller';
import { ViewService } from './infrastructure/view.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ViewDoc.name,
        useFactory: () => getViewSchema(),
      },
    ]),
    OrganizationsModule,
    UsersModule,
  ],
  controllers: [ViewController],
  providers: [ViewService],
  exports: [ViewService],
})
export class ViewModule {}
