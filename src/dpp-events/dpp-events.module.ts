import { Module } from '@nestjs/common';
import { DppEventsService } from './infrastructure/dpp-events.service';
import { DppEventsController } from './presentation/dpp-events.controller';
import { UntpEventsModule } from './modules/untp-events/untp-events.module';
import { OpenepcisEventsModule } from './modules/openepcis-events/openepcis-events.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DppEventDocument,
  DppEventSchema,
} from './infrastructure/dpp-event.document';
import { OpenDppEventsModule } from './modules/open-dpp/open-dpp-events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DppEventDocument.name,
        schema: DppEventSchema,
      },
    ]),
    UntpEventsModule,
    OpenepcisEventsModule,
    OpenDppEventsModule,
  ],
  providers: [DppEventsService],
  controllers: [DppEventsController],
  exports: [DppEventsService],
})
export class DppEventsModule {}
