import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { DppEventType } from './dpp-event-type.enum';
import { OpenDppEvent } from '../modules/open-dpp/domain/open-dpp-event';
import { UntpEvent } from '../modules/untp-events/domain/untp-event';
import { OpenEpcisEvent } from '../modules/openepcis-events/domain/openepcis-event';

export class DppEvent {
  @Expose()
  readonly id: string = randomUUID();

  @Expose()
  readonly kind: DppEventType;

  @Expose()
  readonly createdAt: Date = new Date();

  @Expose()
  readonly updatedAt: Date = new Date();

  @Expose()
  readonly data: OpenDppEvent | UntpEvent | OpenEpcisEvent | null = null;

  static create(plain: {
    kind: DppEventType;
    data: OpenDppEvent | UntpEvent | OpenEpcisEvent | null;
  }) {
    return DppEvent.fromPlain({
      ...plain,
    });
  }

  static fromPlain(plain: unknown): DppEvent {
    return plainToInstance(DppEvent, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  toPlain() {
    return instanceToPlain(this);
  }
}
