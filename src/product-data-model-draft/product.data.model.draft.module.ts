import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductDataModelDraftEntity } from './infrastructure/product.data.model.draft.entity';
import { DataSectionDraftEntity } from './infrastructure/data.section.draft.entity';
import { DataFieldDraftEntity } from './infrastructure/data.field.draft.entity';
import { ProductDataModelDraftController } from './presentation/product.data.model.draft.controller';
import { ProductDataModelDraftService } from './infrastructure/product.data.model.draft.service';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { ProductDataModelService } from '../product-data-model/infrastructure/product.data.model.service';
import { ProductDataModelEntity } from '../product-data-model/infrastructure/product.data.model.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductDataModelDraftEntity,
      ProductDataModelEntity,
      DataSectionDraftEntity,
      DataFieldDraftEntity,
    ]),
    OrganizationsModule,
    UsersModule,
  ],
  controllers: [ProductDataModelDraftController],
  providers: [ProductDataModelDraftService, ProductDataModelService],
  exports: [ProductDataModelDraftService],
})
export class ProductDataModelDraftModule {}
