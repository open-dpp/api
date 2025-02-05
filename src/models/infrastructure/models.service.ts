import { Injectable } from '@nestjs/common';
import { ModelEntity } from './model.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from '../domain/model';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.service';
import { User } from '../../users/domain/user';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';

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
      modelEntity.createdByUserId,
      modelEntity.createdAt,
    );
  }

  async save(product: Model) {
    const userEntity = new UserEntity();
    userEntity.id = product.owner;
    const productEntity = await this.modelRepository.save({
      id: product.id,
      name: product.name,
      description: product.description,
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
    });
    return this.convertToDomain(
      productEntity,
      await this.uniqueModelIdentifierService.findAllByReferencedId(
        productEntity.id,
      ),
    );
  }
}
