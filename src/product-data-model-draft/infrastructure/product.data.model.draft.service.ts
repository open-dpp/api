import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { ProductDataModelDraftEntity } from './product.data.model.draft.entity';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { ProductDataModelDraft } from '../domain/product.data.model.draft';

@Injectable()
export class ProductDataModelDraftService {
  constructor(
    @InjectRepository(ProductDataModelDraftEntity)
    private productDataModelDraftEntityRepository: Repository<ProductDataModelDraftEntity>,
  ) {}

  convertToDomain(productDataModelDraftEntity: ProductDataModelDraftEntity) {
    return ProductDataModelDraft.fromPlain({
      id: productDataModelDraftEntity.id,
      name: productDataModelDraftEntity.name,
      version: productDataModelDraftEntity.version,
      sections: productDataModelDraftEntity.sections.map((s) => ({
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
      publications: productDataModelDraftEntity.publications,
      createdByUserId: productDataModelDraftEntity.createdByUserId,
      ownedByOrganizationId: productDataModelDraftEntity.ownedByOrganizationId,
    });
  }

  async save(productDataModel: ProductDataModelDraft) {
    return this.convertToDomain(
      await this.productDataModelDraftEntityRepository.save({
        ...productDataModel.toPlain(),
      }),
    );
  }

  async findAllByOrganization(organizationId: string) {
    return await this.productDataModelDraftEntityRepository.find({
      select: { id: true, name: true },
      where: { ownedByOrganizationId: Equal(organizationId) },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    const productEntity =
      await this.productDataModelDraftEntityRepository.findOne({
        where: { id: Equal(id) },
        relations: ['sections', 'sections.dataFields'],
      });
    if (!productEntity) {
      throw new NotFoundInDatabaseException(ProductDataModelDraft.name);
    }
    return this.convertToDomain(productEntity);
  }
}
