import { Module } from '@nestjs/common';
import { AasMappingController } from './presentation/aas-mapping.controller';
import { ModelsService } from '../models/infrastructure/models.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from '../models/infrastructure/model.entity';
import { DataValueEntity } from '../models/infrastructure/data.value.entity';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from '../product-data-model/infrastructure/product-data-model.schema';
import { ProductDataModelModule } from '../product-data-model/product.data.model.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UniqueProductIdentifierModule } from '../unique-product-identifier/unique.product.identifier.module';
import { UsersModule } from '../users/users.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModelEntity, DataValueEntity]),
    MongooseModule.forFeature([
      {
        name: ProductDataModelDoc.name,
        schema: ProductDataModelSchema,
      },
    ]),
    OrganizationsModule,
    UniqueProductIdentifierModule,
    UsersModule,
    PermissionsModule,
  ],
  controllers: [AasMappingController],
  providers: [ModelsService],
  exports: [],
})
export class IntegrationModule {}
