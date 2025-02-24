import { ForbiddenException, Injectable } from '@nestjs/common';
import { ModelEntity } from './model.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from '../domain/model';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.service';
import { User } from '../../users/domain/user';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { DataValueEntity } from './data.value.entity';
import { UsersService } from '../../users/infrastructure/users.service';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(ModelEntity)
    private modelRepository: Repository<ModelEntity>,
    private uniqueModelIdentifierService: UniqueProductIdentifierService,
    private readonly usersService: UsersService,
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
      owner: modelEntity.createdByUserId,
      createdAt: modelEntity.createdAt,
    });
  }

  async save(model: Model) {
    const userEntity = await this.usersService.findOne(model.owner);
    if (!userEntity) {
      throw new ForbiddenException();
    }
    const dataValueEntities = model.dataValues.map((dv) => {
      const dataValueEntity = new DataValueEntity();
      dataValueEntity.id = dv.id;
      dataValueEntity.value = dv.value;
      dataValueEntity.dataSectionId = dv.dataSectionId;
      dataValueEntity.dataFieldId = dv.dataFieldId;
      dataValueEntity.row = dv.row;
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
