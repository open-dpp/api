import {
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
import { Model } from '../domain/model';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post()
  async create(
    @Body() createModelDto: CreateModelDto,
    @Request() req: AuthRequest,
  ) {
    const model = new Model(
      undefined,
      createModelDto.name,
      createModelDto.description,
    );
    model.createUniqueProductIdentifier();
    model.assignOwner(req.authContext.user);
    return await this.modelsService.save(model);
  }

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.modelsService.findAllByUser(req.authContext.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.modelsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateModelDto: UpdateModelDto,
    @Request() req: AuthRequest,
  ) {
    const model = new Model(
      id,
      updateModelDto.name,
      updateModelDto.description,
    );
    model.assignOwner(req.authContext.user);
    return this.modelsService.save(model);
  }
}
