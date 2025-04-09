import { Module } from '@nestjs/common';
import { DppEventsService } from './infrastructure/dpp-events.service';
import { DppEventsController } from './presentation/dpp-events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventDoc, EventSchema } from './infrastructure/event.schema';
import {
  IdentifierDoc,
  IdentifierSchema,
} from './infrastructure/identifier.schema';
import {
  CredentialIssuerDoc,
  CredentialIssuerSchema,
} from './infrastructure/credential-issuer.schema';
import {
  DigitalTraceabilityEventDoc,
  DigitalTraceabilityEventSchema,
} from './infrastructure/digital-traceability-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: IdentifierDoc.name,
        schema: IdentifierSchema,
      },
      {
        name: EventDoc.name,
        schema: EventSchema,
      },
      {
        name: CredentialIssuerDoc.name,
        schema: CredentialIssuerSchema,
      },
      {
        name: DigitalTraceabilityEventDoc.name,
        schema: DigitalTraceabilityEventSchema,
      },
    ]),
  ],
  providers: [DppEventsService],
  controllers: [DppEventsController],
})
export class DppEventsModule {}
