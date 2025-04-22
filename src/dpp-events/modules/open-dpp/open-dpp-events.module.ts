import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UniqueProductIdentifierCreatedEvent } from './domain/open-dpp-events/unique-product-identifier-created.event';
import { UniqueProductIdentifierCreatedEventSchema } from './infrastructure/open-dpp-events/unique-product-identifier-created.event-document';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UniqueProductIdentifierCreatedEvent.name,
        schema: UniqueProductIdentifierCreatedEventSchema,
      },
    ]),
  ],
})
export class OpenDppEventsModule {}
