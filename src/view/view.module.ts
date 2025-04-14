import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { getViewSchema, ViewDoc } from './infrastructure/view.schema';
import { ViewController } from './presentation/view.controller';
import { ViewService } from './infrastructure/view.service';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ViewDoc.name,
        useFactory: () => getViewSchema(),
      },
    ]),
    PermissionsModule,
  ],
  controllers: [ViewController],
  providers: [ViewService],
  exports: [ViewService],
})
export class ViewModule {}
