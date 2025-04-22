import { DppEventType } from './dpp-event-type.enum';
import { Expose } from 'class-transformer';

export abstract class DppEventData {
  @Expose()
  type: DppEventType;
}
