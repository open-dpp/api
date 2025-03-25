import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductDataModelEntity } from './infrastructure/product.data.model.entity';
import { ProductDataModelController } from './presentation/product.data.model.controller';
import { ProductDataModelService } from './infrastructure/product.data.model.service';
import { DataFieldEntity } from './infrastructure/data.field.entity';
import { DataSectionEntity } from './infrastructure/data.section.entity';
import { ProductDataModelImportService } from './infrastructure/product.data.model.import.service';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductDataModelEntity,
      DataSectionEntity,
      DataFieldEntity,
    ]),
    OrganizationsModule,
    UsersModule,
  ],
  controllers: [ProductDataModelController],
  providers: [ProductDataModelService, ProductDataModelImportService],
  exports: [ProductDataModelService],
})
export class ProductDataModelModule {}
