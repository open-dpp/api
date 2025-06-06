import { Injectable } from '@nestjs/common';
import { ModelEntity } from './model.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from '../domain/model';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { UniqueProductIdentifierSqlService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.sql.service';

@Injectable()
export class ModelsSQLService {
  constructor(
    @InjectRepository(ModelEntity)
    private modelRepository: Repository<ModelEntity>,
    private uniqueModelIdentifierService: UniqueProductIdentifierSqlService,
  ) {}

  convertToDomain(
    modelEntity: ModelEntity,
    uniqueProductIdentifiers: UniqueProductIdentifier[],
  ) {
    return Model.fromPlain({
      id: modelEntity.id,
      name: modelEntity.name,
      description: modelEntity.description ?? undefined,
      uniqueProductIdentifiers: uniqueProductIdentifiers,
      productDataModelId: modelEntity.productDataModelId ?? undefined,
      dataValues: modelEntity.dataValues
        ? modelEntity.dataValues.map((dv) => ({
            id: dv.id,
            value: dv.value ?? undefined,
            dataSectionId: dv.dataSectionId,
            dataFieldId: dv.dataFieldId,
            row: dv.row ?? undefined,
          }))
        : [],
      createdByUserId: modelEntity.createdByUserId,
      ownedByOrganizationId: modelEntity.ownedByOrganizationId,
      createdAt: modelEntity.createdAt,
    });
  }

  async findAll(): Promise<Model[]> {
    const modelEntities = await this.modelRepository.find({
      relations: ['dataValues'],
    });
    return await Promise.all(
      modelEntities.map(async (modelEntity) =>
        this.convertToDomain(
          modelEntity,
          await this.uniqueModelIdentifierService.findAllByReferencedId(
            modelEntity.id,
          ),
        ),
      ),
    );
  }
}
