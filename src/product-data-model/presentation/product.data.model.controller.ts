import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProductDataModelService } from '../infrastructure/product.data.model.service';
import { ProductDataModel } from '../domain/product.data.model';

@Controller('product-data-models')
export class ProductDataModelController {
  constructor(
    private readonly productDataModelService: ProductDataModelService,
  ) {}

  @Post()
  async create(@Body() createProductDataModelDto: unknown) {
    return await this.productDataModelService.save(
      ProductDataModel.fromPlain(createProductDataModelDto),
    );
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const found = await this.productDataModelService.findOne(id);
    return found.toPlain();
  }

  @Get()
  async getAll() {
    return await this.productDataModelService.findAll();
  }
}
