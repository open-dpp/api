import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { DppEventType } from '../../../domain/dpp-event-type.enum';
import { DppEventData } from '../../../domain/dpp-event-data';
import { OpenDppEventData } from './open-dpp-event-data';

export class OpenDppEvent extends DppEventData {
  @Expose()
  readonly type: DppEventType = DppEventType.OPEN_DPP;

  @Expose()
  readonly data: OpenDppEventData;

  static create(plain: { data: OpenDppEventData }) {
    return OpenDppEvent.fromPlain({
      kind: DppEventType.OPEN_DPP,
      ...plain,
    });
  }

  static fromPlain(plain: unknown): OpenDppEvent {
    return plainToInstance(OpenDppEvent, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  toPlain() {
    return instanceToPlain(this);
  }
}
