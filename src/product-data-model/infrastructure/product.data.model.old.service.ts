import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductDataModelEntity } from './product.data.model.entity';
import { ProductDataModel } from '../domain/product.data.model';

@Injectable()
export class ProductDataModelOldService {
  private readonly logger = new Logger(ProductDataModelOldService.name);
  constructor(
    @InjectRepository(ProductDataModelEntity)
    private productDataModelEntityRepository: Repository<ProductDataModelEntity>,
  ) {}

  convertToDomain(productDataModelEntity: ProductDataModelEntity) {
    return ProductDataModel.fromPlain({
      id: productDataModelEntity.id,
      name: productDataModelEntity.name,
      version: productDataModelEntity.version,
      createdByUserId: productDataModelEntity.createdByUserId,
      ownedByOrganizationId: productDataModelEntity.ownedByOrganizationId,
      visibility: productDataModelEntity.visibility,
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

  async findAll() {
    const found = await this.productDataModelEntityRepository.find({
      relations: ['sections', 'sections.dataFields'],
      order: {
        name: 'ASC',
      },
    });
    const result: ProductDataModel[] = [];
    for (const pm of found) {
      try {
        result.push(this.convertToDomain(pm));
      } catch (e: any) {
        this.logger.error(
          `Failed to read product data model with id ${pm.id} caused by ${e.message}`,
        );
      }
    }
    return result;
  }
}
