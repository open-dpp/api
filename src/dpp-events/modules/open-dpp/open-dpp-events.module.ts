import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OpenDppEventDocument,
  OpenDppEventSchema,
} from './infrastructure/open-dpp-event.document';
import { OpenDppEventsService } from './infrastructure/open-dpp-events.service';
import { OpenDppEventsController } from './presentation/open-dpp-events.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: OpenDppEventDocument.name,
        schema: OpenDppEventSchema,
      },
    ]),
  ],
  providers: [OpenDppEventsService],
  controllers: [OpenDppEventsController],
})
export class OpenDppEventsModule {}
