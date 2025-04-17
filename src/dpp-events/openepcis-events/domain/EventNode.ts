import { Expose } from 'class-transformer';
import { EventInfo } from './EventInfo';
import { EventTypeEnum } from './enums/EventTypeEnum';

export abstract class EventNode {
  @Expose()
  eventId: number;

  @Expose()
  eventType: EventTypeEnum;

  @Expose()
  eventInfo: EventInfo;
}
