import { Injectable } from '@nestjs/common';
import { ProductEntity } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../domain/product';
import { PermalinksService } from '../../permalinks/infrastructure/permalinks.service';
import { Permalink } from '../../permalinks/domain/permalink';
import { User } from '../../users/domain/user';
import { UserEntity } from '../../users/infrastructure/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    private permalinkService: PermalinksService,
  ) {}

  convertToDomain(productEntity: ProductEntity, permalinks: Permalink[]) {
    return new Product(
      productEntity.id,
      productEntity.name,
      productEntity.description,
      permalinks,
      productEntity.createdAt,
    );
  }

  async save(product: Product, user: User) {
    const userEntity = new UserEntity();
    userEntity.id = user.id;
    const productEntity = await this.productRepository.save({
      id: product.id,
      name: product.name,
      description: product.description,
      createdByUser: userEntity,
    });
    for (const permalink of product.permalinks) {
      await this.permalinkService.save(permalink);
    }
    return this.convertToDomain(productEntity, product.permalinks);
  }

  async findAll(user: User) {
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
