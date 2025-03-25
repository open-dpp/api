import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductDataModelDraftController } from './presentation/product-data-model-draft.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { ProductDataModelService } from '../product-data-model/infrastructure/product.data.model.service';
import { ProductDataModelEntity } from '../product-data-model/infrastructure/product.data.model.entity';
import { ProductDataModelDraftService } from './infrastructure/product-data-model-draft.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDraftDoc,
  ProductDataModelDraftSchema,
} from './infrastructure/product-data-model-draft.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductDataModelEntity]),
    MongooseModule.forFeature([
      {
        name: ProductDataModelDraftDoc.name,
        schema: ProductDataModelDraftSchema,
      },
    ]),
    OrganizationsModule,
    UsersModule,
  ],
  controllers: [ProductDataModelDraftController],
  providers: [ProductDataModelService, ProductDataModelDraftService],
  exports: [ProductDataModelDraftService],
})
export class ProductDataModelDraftModule {}
