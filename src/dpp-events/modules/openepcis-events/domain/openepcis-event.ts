import { instanceToPlain, plainToInstance } from 'class-transformer';
import { DppEventType } from '../../../domain/dpp-event-type.enum';
import { DppEventData } from '../../../domain/dpp-event-data';

export class OpenEpcisEvent extends DppEventData {
  readonly type: DppEventType = DppEventType.OPENEPCIS;

  static create() {
    return OpenEpcisEvent.fromPlain({});
  }

  static fromPlain(plain: unknown): OpenEpcisEvent {
    return plainToInstance(OpenEpcisEvent, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  toPlain() {
    return instanceToPlain(this);
  }
}
