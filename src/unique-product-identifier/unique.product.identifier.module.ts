import { Module } from '@nestjs/common';
import { UniqueProductIdentifierService } from './infrastructure/unique.product.identifier.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniqueProductIdentifierEntity } from './infrastructure/unique.product.identifier.entity';
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
import { DppEventsModule } from '../dpp-events/dpp-events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UniqueProductIdentifierEntity,
      ModelEntity,
      ItemEntity,
    ]),
    MongooseModule.forFeature([
      {
        name: ProductDataModelDoc.name,
        schema: ProductDataModelSchema,
      },
    ]),
    OrganizationsModule,
    UsersModule,
    DppEventsModule,
  ],
  controllers: [UniqueProductIdentifierController],
  providers: [
    UniqueProductIdentifierService,
    ModelsService,
    ProductDataModelService,
    ItemsService,
  ],
  exports: [UniqueProductIdentifierService],
})
export class UniqueProductIdentifierModule {}
