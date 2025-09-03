import { Module } from '@nestjs/common';
import { MessageProducerService } from './message.producer.service';

@Module({
  controllers: [],
  providers: [MessageProducerService],

  exports: [MessageProducerService],
})
export class EventMessagesModule {}
