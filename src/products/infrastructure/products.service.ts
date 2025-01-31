import { Injectable } from '@nestjs/common';
import { ProductEntity } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../domain/product';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.service';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { User } from '../../users/domain/user';
import { UserEntity } from '../../users/infrastructure/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    private permalinkService: UniqueProductIdentifierService,
  ) {}

  convertToDomain(
    productEntity: ProductEntity,
    permalinks: UniqueProductIdentifier[],
  ) {
    return new Product(
      productEntity.id,
      productEntity.name,
      productEntity.description,
      permalinks,
      productEntity.createdByUserId,
      productEntity.createdAt,
    );
  }

  async save(product: Product) {
    const userEntity = new UserEntity();
    userEntity.id = product.owner;
    const productEntity = await this.productRepository.save({
      id: product.id,
      name: product.name,
      description: product.description,
      createdByUser: userEntity,
    });
    for (const permalink of product.uniqueProductIdentifiers) {
      await this.permalinkService.save(permalink);
    }
    return this.convertToDomain(
      productEntity,
      product.uniqueProductIdentifiers,
    );
  }

  async findAllByUser(user: User) {
    const productEntities = await this.productRepository.find({
      where: { createdByUserId: user.id },
    });
    return await Promise.all(
      productEntities.map(async (entity: ProductEntity) => {
        return this.convertToDomain(
          entity,
          await this.permalinkService.findAllByReferencedId(entity.id),
        );
      }),
    );
  }

  async findOne(id: string) {
    const productEntity = await this.productRepository.findOne({
      where: { id },
    });
    return this.convertToDomain(
      productEntity,
      await this.permalinkService.findAllByReferencedId(productEntity.id),
    );
  }
}
