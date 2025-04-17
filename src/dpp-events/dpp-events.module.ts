import { Module } from '@nestjs/common';
import { DppEventsService } from './infrastructure/dpp-events.service';
import { DppEventsController } from './presentation/dpp-events.controller';
import { UntpEventsModule } from './untp-events/untp-events.module';
import { OpenepcisEventsModule } from './openepcis-events/openepcis-events.module';
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
    UntpEventsModule,
    OpenepcisEventsModule,
  ],
  providers: [DppEventsService],
  controllers: [DppEventsController],
})
export class DppEventsModule {}
