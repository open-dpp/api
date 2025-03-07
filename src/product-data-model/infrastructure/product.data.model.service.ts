import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { ProductDataModelEntity } from './product.data.model.entity';
import { ProductDataModel } from '../domain/product.data.model';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';

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
        name: s.name,
        type: s.type,
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

  async findAll(
    where?:
      | FindOptionsWhere<ProductDataModelEntity>[]
      | FindOptionsWhere<ProductDataModelEntity>,
  ) {
    return await this.productDataModelEntityRepository.find({
      select: { id: true, name: true },
      order: {
        name: 'ASC',
      },
      where,
    });
  }

  async findOne(id: string) {
    const productEntity = await this.productDataModelEntityRepository.findOne({
      where: { id: Equal(id) },
      relations: ['sections', 'sections.dataFields'],
    });
    if (!productEntity) {
      throw new NotFoundInDatabaseException(ProductDataModel.name);
    }
    return this.convertToDomain(productEntity);
  }
}
