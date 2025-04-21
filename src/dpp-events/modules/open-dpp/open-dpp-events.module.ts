import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OpenDppEventDocument,
  OpenDppEventSchema,
} from './infrastructure/open-dpp-event.document';
import { OpenDppEventsService } from './infrastructure/open-dpp-events.service';
import { OpenDppEventsController } from './presentation/open-dpp-events.controller';
import { UniqueProductIdentifierCreatedEvent } from './domain/open-dpp-events/unique-product-identifier-created.event';
import { UniqueProductIdentifierCreatedEventSchema } from './infrastructure/open-dpp-events/unique-product-identifier-created.event-document';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: OpenDppEventDocument.name,
        schema: OpenDppEventSchema,
        discriminators: [
          {
            name: UniqueProductIdentifierCreatedEvent.name,
            schema: UniqueProductIdentifierCreatedEventSchema,
          },
        ],
      },
    ]),
  ],
  providers: [OpenDppEventsService],
  controllers: [OpenDppEventsController],
})
export class OpenDppEventsModule {}
