import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthRequest } from '../auth/auth-request';
import { PermalinksService } from '../permalinks/permalinks.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly permalinkService: PermalinksService,
  ) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: AuthRequest,
  ) {
    const product = await this.productsService.create(
      createProductDto,
      req.authContext,
    );
    await this.permalinkService.create({ product, view: 'all' });
    return await this.productsService.findOne(product.id);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
