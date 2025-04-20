import { Injectable } from '@nestjs/common';
import { ModelEntity } from './model.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { Model } from '../domain/model';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.service';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { DataValueEntity } from './data.value.entity';
import { UsersService } from '../../users/infrastructure/users.service';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(ModelEntity)
    private modelRepository: Repository<ModelEntity>,
    private organizationService: OrganizationsService,
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
      createdByUserId: modelEntity.createdByUserId,
      ownedByOrganizationId: modelEntity.ownedByOrganizationId,
      createdAt: modelEntity.createdAt,
    });
  }

  async save(model: Model) {
    const userEntity = await this.usersService.findOneAndFail(
      model.createdByUserId,
    );
    const organizationEntity = await this.organizationService.findOneOrFail(
      model.ownedByOrganizationId,
    );
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
      ownedByOrganization: organizationEntity,
    });
    for (const uniqueProductIdentifier of model.uniqueProductIdentifiers) {
      await this.uniqueModelIdentifierService.save(uniqueProductIdentifier);
    }
    const domainObject = this.convertToDomain(
      modelEntity,
      model.uniqueProductIdentifiers,
    );

    return domainObject;
  }

  async findAllByOrganization(organizationId: string) {
    const productEntities = await this.modelRepository.find({
      where: { ownedByOrganizationId: Equal(organizationId) },
      order: { name: 'ASC' },
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

  async findOne(id: string): Promise<Model> {
    const modelEntity = await this.modelRepository.findOne({
      where: { id: Equal(id) },
      relations: ['dataValues'],
    });
    if (!modelEntity) {
      throw new NotFoundInDatabaseException(Model.name);
    }
    return this.convertToDomain(
      modelEntity,
      await this.uniqueModelIdentifierService.findAllByReferencedId(
        modelEntity.id,
      ),
    );
  }
}
