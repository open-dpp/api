import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../products/infrastructure/product.entity';
import { ItemEntity } from './infrastructure/item.entity';
import { ProductsModule } from '../products/products.module';
import { ItemsController } from './presentation/items.controller';
import { ItemsService } from './infrastructure/items.service';
import { UniqueProductIdentifierModule } from '../unique-product-identifier/unique.product.identifier.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, ItemEntity]),
    ProductsModule,
    UniqueProductIdentifierModule,
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
