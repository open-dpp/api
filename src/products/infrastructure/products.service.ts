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
    private uniqueProductIdentifierService: UniqueProductIdentifierService,
  ) {}

  convertToDomain(
    productEntity: ProductEntity,
    uniqueProductIdentifiers: UniqueProductIdentifier[],
  ) {
    return new Product(
      productEntity.id,
      productEntity.name,
      productEntity.description,
      uniqueProductIdentifiers,
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
    for (const uniqueProductIdentifier of product.uniqueProductIdentifiers) {
      await this.uniqueProductIdentifierService.save(uniqueProductIdentifier);
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
          await this.uniqueProductIdentifierService.findAllByReferencedId(
            entity.id,
          ),
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
      await this.uniqueProductIdentifierService.findAllByReferencedId(
        productEntity.id,
      ),
    );
  }
}
