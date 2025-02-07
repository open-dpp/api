import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { AuthRequest } from '../../auth/auth-request';
import { ProductDataModelService } from '../infrastructure/product.data.model.service';
import { ProductDataModel } from '../domain/product.data.model';

@Controller('product-data-models')
export class ProductDataModelController {
  constructor(
    private readonly productDataModelService: ProductDataModelService,
  ) {}

  @Post()
  async create(
    @Body() createProductDataModelDto: unknown,
    @Request() req: AuthRequest,
  ) {
    return await this.productDataModelService.save(
      ProductDataModel.fromPlain(createProductDataModelDto),
    );
  }
}
