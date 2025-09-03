import { Module } from '@nestjs/common';
import { MessageBrokerService } from './message-broker.service';

@Module({
  controllers: [],
  providers: [MessageBrokerService],

  exports: [MessageBrokerService],
})
export class EventMessagesModule {}
