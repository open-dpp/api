import { Injectable } from '@nestjs/common';
import { ModelEntity } from './model.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from '../domain/model';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.service';
import { User } from '../../users/domain/user';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { DataValueEntity } from './data.value.entity';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(ModelEntity)
    private modelRepository: Repository<ModelEntity>,
    private uniqueModelIdentifierService: UniqueProductIdentifierService,
  ) {}

  convertToDomain(
    modelEntity: ModelEntity,
    uniqueProductIdentifiers: UniqueProductIdentifier[],
  ) {
    return Model.fromPlain({
      id: modelEntity.id,
      name: modelEntity.name,
      description: modelEntity.description,
      uniqueProductIdentifiers: uniqueProductIdentifiers,
      productDataModelId: modelEntity.productDataModelId ?? undefined,
      dataValues: modelEntity.dataValues
        ? modelEntity.dataValues.map((dv) => ({
            id: dv.id,
            value: dv.value ?? undefined,
            dataSectionId: dv.dataSectionId,
            dataFieldId: dv.dataFieldId,
          }))
        : [],
      owner: modelEntity.createdByUserId,
      createdAt: modelEntity.createdAt,
    });
  }

  async save(model: Model) {
    const userEntity = new UserEntity();
    userEntity.id = model.owner;
    const dataValueEntities = model.dataValues.map((dv) => {
      const dataValueEntity = new DataValueEntity();
      dataValueEntity.id = dv.id;
      dataValueEntity.value = dv.value;
      dataValueEntity.dataSectionId = dv.dataSectionId;
      dataValueEntity.dataFieldId = dv.dataFieldId;
      return dataValueEntity;
    });
    const modelEntity = await this.modelRepository.save({
      id: model.id,
      name: model.name,
      description: model.description,
      productDataModelId: model.productDataModelId,
      dataValues: dataValueEntities,
      createdByUser: userEntity,
    });
    for (const uniqueProductIdentifier of model.uniqueProductIdentifiers) {
      await this.uniqueModelIdentifierService.save(uniqueProductIdentifier);
    }
    return this.convertToDomain(modelEntity, model.uniqueProductIdentifiers);
  }

  async findAllByUser(user: User) {
    const productEntities = await this.modelRepository.find({
      where: { createdByUserId: user.id },
    });
    return await Promise.all(
      productEntities.map(async (entity: ModelEntity) => {
        return this.convertToDomain(
          entity,
          await this.uniqueModelIdentifierService.findAllByReferencedId(
            entity.id,
          ),
        );
      }),
    );
  }

  async findOne(id: string) {
    const productEntity = await this.modelRepository.findOne({
      where: { id },
      relations: ['dataValues'],
    });
    return this.convertToDomain(
      productEntity,
      await this.uniqueModelIdentifierService.findAllByReferencedId(
        productEntity.id,
      ),
    );
  }
}
