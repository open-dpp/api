import { Module } from '@nestjs/common';
import { ProductsService } from './infrastructure/products.service';
import { ProductsController } from './presentation/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './infrastructure/product.entity';
import { PermalinksModule } from '../permalinks/permalinks.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), PermalinksModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
