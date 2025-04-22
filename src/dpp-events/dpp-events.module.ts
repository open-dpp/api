import { Module } from '@nestjs/common';
import { DppEventsService } from './infrastructure/dpp-events.service';
import { DppEventsController } from './presentation/dpp-events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DppEventDocument,
  DppEventSchema,
} from './infrastructure/dpp-event.document';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DppEventDocument.name,
        schema: DppEventSchema,
      },
    ]),
  ],
  providers: [DppEventsService],
  controllers: [DppEventsController],
  exports: [DppEventsService],
})
export class DppEventsModule {}
