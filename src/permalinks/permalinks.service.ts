import { Injectable } from '@nestjs/common';
import { CreatePermalinkDto } from './dto/create-permalink.dto';
import { UpdatePermalinkDto } from './dto/update-permalink.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permalink } from './entities/permalink.entity';
import { ProductsService } from '../products/products.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PermalinksService {
  constructor(
    @InjectRepository(Permalink)
    private permalinkRepository: Repository<Permalink>,
    private readonly productService: ProductsService,
  ) {}

  async create(createPermalinkDto: CreatePermalinkDto) {
    const product = await this.productService.findOne(
      createPermalinkDto.productId,
    );
    return this.permalinkRepository.save({
      uuid: randomUUID(),
      view: createPermalinkDto.view,
      product: product,
    });
  }

  findAll() {
    return this.permalinkRepository.find();
  }

  findOne(uuid: string) {
    return this.permalinkRepository.findOne({
      where: { uuid },
      relations: {
        product: true,
      },
    });
  }

  update(id: string, updatePermalinkDto: UpdatePermalinkDto) {
    return this.permalinkRepository.update(id, {
      view: updatePermalinkDto.view,
    });
  }

  remove(id: string) {
    return this.permalinkRepository.delete(id);
  }
}
