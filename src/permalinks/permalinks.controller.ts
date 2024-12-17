import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PermalinksService } from './permalinks.service';
import { CreatePermalinkDto } from './dto/create-permalink.dto';
import { UpdatePermalinkDto } from './dto/update-permalink.dto';
import { Public } from '../auth/public/public.decorator';

@Controller('permalinks')
export class PermalinksController {
  constructor(private readonly permalinksService: PermalinksService) {}

  @Post()
  create(@Body() createPermalinkDto: CreatePermalinkDto) {
    return this.permalinksService.create(createPermalinkDto);
  }

  @Get()
  findAll() {
    return this.permalinksService.findAll();
  }

  @Get(':uuid')
  @Public()
  findOne(@Param('uuid') uuid: string) {
    return this.permalinksService.findOne(uuid);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermalinkDto: UpdatePermalinkDto,
  ) {
    return this.permalinksService.update(id, updatePermalinkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permalinksService.remove(id);
  }
}
