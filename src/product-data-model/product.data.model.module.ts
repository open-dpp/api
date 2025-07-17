import { Module } from '@nestjs/common';
import { ProductDataModelController } from './presentation/product.data.model.controller';
import { ProductDataModelService } from './infrastructure/product-data-model.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from './infrastructure/product-data-model.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { KeycloakResourcesModule } from '../keycloak-resources/keycloak-resources.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ProductDataModelDoc.name,
        schema: ProductDataModelSchema,
      },
    ]),
    KeycloakResourcesModule,
    PermissionsModule,
  ],
  controllers: [ProductDataModelController],
  providers: [ProductDataModelService],
  exports: [ProductDataModelService],
})
export class ProductDataModelModule {}
