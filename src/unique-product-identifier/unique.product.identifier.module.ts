import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniqueProductIdentifierController } from './presentation/unique.product.identifier.controller';
import { ModelsService } from '../models/infrastructure/models.service';
import { ModelEntity } from '../models/infrastructure/model.entity';
import { ProductDataModelService } from '../product-data-model/infrastructure/product-data-model.service';
import { UsersModule } from '../users/users.module';
import { ItemsService } from '../items/infrastructure/items.service';
import { ItemEntity } from '../items/infrastructure/item.entity';
import { OrganizationsModule } from '../organizations/organizations.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from '../product-data-model/infrastructure/product-data-model.schema';
import { ModelDoc, ModelSchema } from '../models/infrastructure/model.schema';
import { ItemDoc, ItemSchema } from '../items/infrastructure/item.schema';
import {
  UniqueProductIdentifierDoc,
  UniqueProductIdentifierSchema,
} from './infrastructure/unique-product-identifier.schema';
import { UniqueProductIdentifierService } from './infrastructure/unique-product-identifier.service';
import { UniqueProductIdentifierSqlService } from './infrastructure/unique.product.identifier.sql.service';
import { UniqueProductIdentifierEntity } from './infrastructure/unique.product.identifier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UniqueProductIdentifierEntity,
      ModelEntity,
      ItemEntity,
    ]),
    MongooseModule.forFeature([
      {
        name: UniqueProductIdentifierDoc.name,
        schema: UniqueProductIdentifierSchema,
      },
      {
        name: ItemDoc.name,
        schema: ItemSchema,
      },
      {
        name: ModelDoc.name,
        schema: ModelSchema,
      },
      {
        name: ProductDataModelDoc.name,
        schema: ProductDataModelSchema,
      },
    ]),
    OrganizationsModule,
    UsersModule,
  ],
  controllers: [UniqueProductIdentifierController],
  providers: [
    UniqueProductIdentifierService,
    UniqueProductIdentifierSqlService,
    ModelsService,
    ProductDataModelService,
    ItemsService,
  ],
  exports: [UniqueProductIdentifierService, UniqueProductIdentifierSqlService],
})
export class UniqueProductIdentifierModule {}
