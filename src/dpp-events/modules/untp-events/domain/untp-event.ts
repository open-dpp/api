import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { DppEventType } from '../../../domain/dpp-event-type.enum';
import { DppEventData } from '../../../domain/dpp-event-data';

export class UntpEvent extends DppEventData {
  @Expose()
  readonly type: DppEventType = DppEventType.UNTP;

  static create() {
    return UntpEvent.fromPlain({});
  }

  static fromPlain(plain: unknown): UntpEvent {
    return plainToInstance(UntpEvent, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  toPlain() {
    return instanceToPlain(this);
  }
}
