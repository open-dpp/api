import { Controller, Get, Param, Post, Request } from '@nestjs/common';
import { AuthRequest } from '../../../../auth/auth-request';
import { OpenDppEventsService } from '../infrastructure/open-dpp-events.service';

@Controller('open-dpp-events')
export class OpenDppEventsController {
  constructor(private readonly openDppEventsService: OpenDppEventsService) {}

  @Post()
  async create(@Request() req: AuthRequest) {
    const saved = await this.openDppEventsService.save(req.body);
    return saved.toPlain();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return await this.openDppEventsService.findById(id);
  }
}
