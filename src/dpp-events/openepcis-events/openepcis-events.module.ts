import { Module } from '@nestjs/common';
import { OpenepcisEventsService } from './infrastructure/openepcis-events.service';
import { OpenepcisEventsController } from './presentation/openepcis-events.controller';

@Module({
  imports: [],
  providers: [OpenepcisEventsService],
  controllers: [OpenepcisEventsController],
})
export class OpenepcisEventsModule {}
