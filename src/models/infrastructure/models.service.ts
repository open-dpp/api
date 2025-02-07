import { Injectable } from '@nestjs/common';
import { ModelEntity } from './model.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from '../domain/model';
import { DataValue, Product } from '../domain/product';
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
    return new Model(
      modelEntity.id,
      modelEntity.name,
      modelEntity.description,
      uniqueProductIdentifiers,
      productEntity.productDataModelId,
      productEntity.dataValues.map(
        (dv) =>
          new DataValue(
            dv.id,
            dv.value ?? undefined,
            dv.dataSectionId,
            dv.dataFieldId,
          ),
      ),
        modelEntity.createdByUserId,
        modelEntity.createdAt,
    );
  }

  async save(product: Model) {
    const userEntity = new UserEntity();
    userEntity.id = product.owner;
      const dataValueEntities = product.dataValues.map((dv) => {
          const dataValueEntity = new DataValueEntity();
          dataValueEntity.id = dv.id;
          dataValueEntity.value = dv.value;
          dataValueEntity.dataSectionId = dv.dataSectionId;
          dataValueEntity.dataFieldId = dv.dataFieldId;
          return dataValueEntity;
      });
    const productEntity = await this.modelRepository.save({
      id: product.id,
      name: product.name,
      description: product.description,
      productDataModelId: product.productDataModelId,
      dataValues: dataValueEntities,
      createdByUser: userEntity,
    });
    for (const uniqueProductIdentifier of product.uniqueProductIdentifiers) {
      await this.uniqueModelIdentifierService.save(uniqueProductIdentifier);
    }
    return this.convertToDomain(
      productEntity,
      product.uniqueProductIdentifiers,
    );
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
