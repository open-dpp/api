import { Module } from '@nestjs/common';
import { UniqueProductIdentifierService } from './infrastructure/unique.product.identifier.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniqueProductIdentifierEntity } from './infrastructure/unique.product.identifier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UniqueProductIdentifierEntity])],
  providers: [UniqueProductIdentifierService],
  exports: [UniqueProductIdentifierService],
})
export class UniqueProductIdentifierModule {}
