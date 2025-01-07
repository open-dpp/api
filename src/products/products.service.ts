import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthContext } from '../auth/auth-request';
import { Product } from './entities/product';
import { PermalinksService } from '../permalinks/permalinks.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    private permalinkService: PermalinksService,
  ) {}

  convert(productEntity: ProductEntity, permalinks: { uuid: string }[]) {
    return new Product(
      productEntity.id,
      productEntity.name,
      productEntity.createdAt,
      productEntity.updatedAt,
      productEntity.deletedAt,
      productEntity.description,
      permalinks,
    );
  }

  async create(createProductDto: CreateProductDto, authContext: AuthContext) {
    const product = await this.productRepository.save({
      name: createProductDto.name,
      description: createProductDto.description,
      createdByUser: authContext.user,
    });
    const { uuid } = await this.permalinkService.create({
      referencedId: product.id,
      view: 'all',
    });
    return this.convert(product, [{ uuid }]);
  }

  async findAll(authContext: AuthContext) {
    const productEntities = await this.productRepository.find({
      where: { createdByUserId: authContext.user.id },
    });
    return await Promise.all(
      productEntities.map(async (entity: ProductEntity) => {
        return this.convert(entity, [
          {
            uuid: (await this.permalinkService.findOneByReferencedId(entity.id))
              .uuid,
          },
        ]);
      }),
    );
  }

  async findOne(id: string) {
    const productEntity = await this.productRepository.findOne({
      where: { id },
    });
    const { uuid } = await this.permalinkService.findOneByReferencedId(
      productEntity.id,
    );
    return this.convert(productEntity, [{ uuid }]);
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.productRepository.update(id, {
      name: updateProductDto.name,
      description: updateProductDto.description,
    });
  }

  remove(id: string) {
    return this.productRepository.delete(id);
  }
}
