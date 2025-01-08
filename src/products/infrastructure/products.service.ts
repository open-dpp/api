import { Injectable } from '@nestjs/common';
import { ProductEntity } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthContext } from '../../auth/auth-request';
import { Product } from '../domain/product';
import { PermalinksService } from '../../permalinks/infrastructure/permalinks.service';
import { Permalink } from '../../permalinks/domain/permalink';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    private permalinkService: PermalinksService,
  ) {}

  converToDomain(productEntity: ProductEntity, permalinks: Permalink[]) {
    return new Product(
      productEntity.id,
      productEntity.name,
      productEntity.description,
      permalinks,
      productEntity.createdAt,
    );
  }

  async save(product: Product, authContext: AuthContext) {
    const productEntity = await this.productRepository.save({
      id: product.id,
      name: product.name,
      description: product.description,
      createdByUser: authContext.user,
    });
    for (const permalink of product.permalinks) {
      await this.permalinkService.save(permalink);
    }
    return this.converToDomain(productEntity, product.permalinks);
  }

  async findAll(authContext: AuthContext) {
    const productEntities = await this.productRepository.find({
      where: { createdByUserId: authContext.user.id },
    });
    return await Promise.all(
      productEntities.map(async (entity: ProductEntity) => {
        return this.converToDomain(
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
    return this.converToDomain(
      productEntity,
      await this.permalinkService.findAllByReferencedId(productEntity.id),
    );
  }
}
