import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductDataModelEntity } from './product.data.model.entity';
import {
  DataSection,
  makeDataField,
  ProductDataModel,
} from '../domain/product.data.model';

@Injectable()
export class ProductDataModelService {
  constructor(
    @InjectRepository(ProductDataModelEntity)
    private productDataModelEntityRepository: Repository<ProductDataModelEntity>,
  ) {}

  convertToDomain(productDataModelEntity: ProductDataModelEntity) {
    return new ProductDataModel(
      productDataModelEntity.id,
      productDataModelEntity.name,
      'v1',
      productDataModelEntity.sections.map(
        (s) =>
          new DataSection(
            s.id,
            s.dataFields.map((f) =>
              makeDataField(f.id, f.type, f.name, f.options),
            ),
          ),
      ),
    );
  }

  async save(productDataModel: ProductDataModel) {
    return this.convertToDomain(
      await this.productDataModelEntityRepository.save({
        id: productDataModel.id,
        version: productDataModel.version,
        name: productDataModel.name,
        sections: productDataModel.sections.map((s) => ({
          id: s.id,
          dataFields: s.dataFields.map((f) => ({
            id: f.id,
            name: f.name,
            options: f.options,
            type: f.type,
          })),
        })),
      }),
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
