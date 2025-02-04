import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductDataModelEntity } from './product.data.model.entity';
import {
  DataField,
  DataSection,
  DataType,
  ProductDataModel,
  TextField,
} from '../domain/product.data.model';
import { DataFieldEntity } from './data.field.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductDataModelService {
  constructor(
    @InjectRepository(ProductDataModelEntity)
    private productDataModelEntityRepository: Repository<ProductDataModelEntity>,
  ) {}

  convertDataFieldEntityToDomain(dataFieldEntity: DataFieldEntity): DataField {
    const ClassType = { [DataType.TEXT_FIELD]: TextField };
    return plainToInstance(ClassType[dataFieldEntity.type], {
      id: dataFieldEntity.id,
      type: dataFieldEntity.type,
      name: dataFieldEntity.name,
      value: dataFieldEntity.value,
    });
  }

  convertToDomain(productDataModelEntity: ProductDataModelEntity) {
    return new ProductDataModel(
      productDataModelEntity.id,
      'v1',
      productDataModelEntity.sections.map(
        (s) =>
          new DataSection(
            s.id,
            s.dataFields.map((f) => this.convertDataFieldEntityToDomain(f)),
          ),
      ),
    );
  }

  async save(productDataModel: ProductDataModel) {
    return this.convertToDomain(
      await this.productDataModelEntityRepository.save({
        id: productDataModel.id,
        version: productDataModel.version,
        sections: productDataModel.sections.map((s) => ({
          id: s.id,
          dataFields: s.dataFields.map((f) => ({
            id: f.id,
            name: f.name,
            value: f.value,
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
