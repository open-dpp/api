import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ProductsService } from '../infrastructure/products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthRequest } from '../../auth/auth-request';
import { Product } from '../domain/product';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: AuthRequest,
  ) {
    const product = new Product(
      undefined,
      createProductDto.name,
      createProductDto.description,
    );
    product.createPermalink();
    return await this.productsService.save(product, req.authContext);
  }

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.productsService.findAll(req.authContext);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: AuthRequest,
  ) {
    const product = new Product(
      id,
      updateProductDto.name,
      updateProductDto.description,
    );
    return this.productsService.save(product, req.authContext);
  }
}
