import { Controller, Get, Param, Post, Request } from '@nestjs/common';
import { AuthRequest } from '../../auth/auth-request';
import { DppEventsService } from '../infrastructure/dpp-events.service';

@Controller('dpp-events')
export class DppEventsController {
  constructor(private readonly dppEventsService: DppEventsService) {}

  @Post()
  async create(@Request() req: AuthRequest) {
    const saved = await this.dppEventsService.save(req.body);
    return saved.toPlain();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return await this.dppEventsService.findById(id);
  }
}
