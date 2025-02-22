import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ModelsService } from '../infrastructure/models.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { AuthRequest } from '../../auth/auth-request';
import { DataValue, Model } from '../domain/model';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product.data.model.service';

@Controller('models')
export class ModelsController {
  constructor(
    private readonly modelsService: ModelsService,
    private readonly productDataModelService: ProductDataModelService,
  ) {}

  @Post()
  async create(
    @Body() createModelDto: CreateModelDto,
    @Request() req: AuthRequest,
  ) {
    const model = Model.fromPlain({
      name: createModelDto.name,
      description: createModelDto.description,
    });
    model.createUniqueProductIdentifier();
    // model.assignOwner(req.authContext.user);
    return (await this.modelsService.save(model)).toPlain();
  }

  @Get()
  async findAll(@Request() req: AuthRequest) {
    return (await this.modelsService.findAllByUser(req.authContext.user)).map(
      (m) => m.toPlain(),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return (await this.modelsService.findOne(id)).toPlain();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateModelDto: UpdateModelDto,
  ) {
    const model = await this.modelsService.findOne(id);
    /* if (!model.isOwnedBy(req.authContext.user)) {
      throw new ForbiddenException();
    } */
    // TODO: check if member of organization
    const mergedModel = model.mergeWithPlain(updateModelDto);
    return (await this.modelsService.save(mergedModel)).toPlain();
  }

  @Post(':modelId/product-data-models/:productDataModelId')
  async assignProductDataModelToModel(
    @Param('modelId') modelId: string,
    @Param('productDataModelId') productDataModelId: string,
  ) {
    // TODO: Check if user has permission to access product data model
    const productDataModel =
      await this.productDataModelService.findOne(productDataModelId);
    const model = await this.modelsService.findOne(modelId);
    /* if (!model.isOwnedBy(req.authContext.user)) {
      throw new ForbiddenException();
    } */
    // TODO: check if member of organization
    model.assignProductDataModel(productDataModel);
    return (await this.modelsService.save(model)).toPlain();
  }

  @Patch(':modelId/data-values')
  async updateDataValues(
    @Param('modelId') modelId: string,
    @Body() updateDataValues: unknown,
  ) {
    const model = await this.modelsService.findOne(modelId);
    /* if (!model.isOwnedBy(req.authContext.user)) {
      throw new ForbiddenException();
    } */
    // TODO: check if member of organization
    const mergedModel = model.mergeWithPlain({ dataValues: updateDataValues });
    const productDataModel = await this.productDataModelService.findOne(
      mergedModel.productDataModelId,
    );
    const validationResult = productDataModel.validate(mergedModel.dataValues);
    if (!validationResult.isValid) {
      throw new BadRequestException(validationResult.toJson());
    }
    return (await this.modelsService.save(mergedModel)).toPlain();
  }

  @Post(':modelId/data-values')
  async addDataValues(
    @Param('modelId') modelId: string,
    @Body() addedDataValues: unknown[],
  ) {
    const model = await this.modelsService.findOne(modelId);
    /* if (!model.isOwnedBy(req.authContext.user)) {
      throw new ForbiddenException();
    } */
    // TODO: check if member of organization
    model.addDataValues(addedDataValues.map((d) => DataValue.fromPlain(d)));
    const productDataModel = await this.productDataModelService.findOne(
      model.productDataModelId,
    );
    const validationResult = productDataModel.validate(model.dataValues);
    if (!validationResult.isValid) {
      throw new BadRequestException(validationResult.toJson());
    }
    return (await this.modelsService.save(model)).toPlain();
  }
}
