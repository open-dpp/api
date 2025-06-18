import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { AuthRequest } from '../../auth/auth-request';
import { TraceabilityEventsService } from '../infrastructure/traceability-events.service';

@Controller('dpp-events')
export class TraceabilityEventsController {
  constructor(private readonly dppEventsService: TraceabilityEventsService) {}

  @Post()
  async create(@Body() body: any, @Request() req: AuthRequest) {
    return await this.dppEventsService.create({
      ...body,
      userId: req.authContext.user.id,
    });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return await this.dppEventsService.findById(id);
  }
}
