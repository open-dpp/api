import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductDataModelEntity } from './product.data.model.entity';
import { ProductDataModel } from '../domain/product.data.model';

@Injectable()
export class ProductDataModelService {
  constructor(
    @InjectRepository(ProductDataModelEntity)
    private productDataModelEntityRepository: Repository<ProductDataModelEntity>,
  ) {}

  convertToDomain(productDataModelEntity: ProductDataModelEntity) {
    return ProductDataModel.fromPlain({
      id: productDataModelEntity.id,
      name: productDataModelEntity.name,
      version: productDataModelEntity.version,
      sections: productDataModelEntity.sections.map((s) => ({
        id: s.id,
        dataFields: s.dataFields.map((f) => ({
          id: f.id,
          type: f.type,
          name: f.name,
          options: f.options,
        })),
      })),
    });
  }

  async save(productDataModel: ProductDataModel) {
    return this.convertToDomain(
      await this.productDataModelEntityRepository.save(
        productDataModel.toPlain(),
      ),
    );
  }
  async findOne(id: string) {
    const productEntity = await this.productDataModelEntityRepository.findOne({
      where: { id },
      relations: ['sections', 'sections.dataFields'],
    });
    return this.convertToDomain(productEntity);
  }
}
