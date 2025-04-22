import { Module } from '@nestjs/common';
import { DppEventsService } from './infrastructure/dpp-events.service';
import { DppEventsController } from './presentation/dpp-events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DppEventDocument,
  DppEventSchema,
} from './infrastructure/dpp-event.document';
import { OpenDppEventsModule } from './modules/open-dpp/open-dpp-events.module';
import { OpenDppEventSchema } from './modules/open-dpp/infrastructure/open-dpp-event.document';
import { OpenepcisEventSchema } from './modules/openepcis-events/infrastructure/openepcis-event.document';
import { UntpEventSchema } from './modules/untp-events/infrastructure/untp-event.document';
import { DppEventType } from './domain/dpp-event-type.enum';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DppEventDocument.name,
        schema: DppEventSchema,
        discriminators: [
          {
            name: DppEventType.OPEN_DPP,
            schema: OpenDppEventSchema,
          },
          {
            name: DppEventType.OPENEPCIS,
            schema: OpenepcisEventSchema,
          },
          {
            name: DppEventType.UNTP,
            schema: UntpEventSchema,
          },
        ],
      },
    ]),
    OpenDppEventsModule,
  ],
  providers: [DppEventsService],
  controllers: [DppEventsController],
  exports: [DppEventsService],
})
export class DppEventsModule {}
