import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { DppEvent } from '../../../domain/dpp-event';
import { DppEventType } from '../../../domain/dpp-event-type.enum';
import { OpenDppEventType } from './open-dpp-event-type.enum';

export class OpenDppEvent extends DppEvent {
  @Expose()
  readonly kind: DppEventType = DppEventType.OPEN_DPP;

  @Expose()
  readonly subKind: OpenDppEventType;

  static create() {
    return OpenDppEvent.fromPlain({
      kind: DppEventType.OPEN_DPP,
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
