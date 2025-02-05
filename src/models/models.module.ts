import { Module } from '@nestjs/common';
import { ModelsService } from './infrastructure/models.service';
import { ModelsController } from './presentation/models.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from './infrastructure/model.entity';
import { UniqueProductIdentifierModule } from '../unique-product-identifier/unique.product.identifier.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModelEntity]),
    UniqueProductIdentifierModule,
  ],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService],
})
export class ModelsModule {}
