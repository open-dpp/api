import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  IdentifierDoc,
  IdentifierSchema,
} from './infrastructure/identifier.schema';
import { EventDoc, EventSchema } from './infrastructure/event.schema';
import {
  CredentialIssuerDoc,
  CredentialIssuerSchema,
} from './infrastructure/credential-issuer.schema';
import {
  DigitalTraceabilityEventDoc,
  DigitalTraceabilityEventSchema,
} from './infrastructure/digital-traceability-event.schema';
import { UntpEventsService } from './infrastructure/untp-events.service';
import { UntpEventsController } from './presentation/untp-events.controller';

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
  providers: [UntpEventsService],
  controllers: [UntpEventsController],
})
export class UntpEventsModule {}
