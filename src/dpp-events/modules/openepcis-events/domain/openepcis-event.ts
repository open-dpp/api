import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { OpenDppEventType } from '../../open-dpp/domain/open-dpp-event-type.enum';
import { DppEventType } from '../../../domain/dpp-event-type.enum';

export class OpenEpcisEvent {
  @Expose()
  readonly id: string = randomUUID();

  @Expose()
  readonly kind: DppEventType = DppEventType.OPENEPCIS;

  @Expose()
  readonly createdAt: Date = new Date();

  @Expose()
  readonly updatedAt: Date = new Date();

  static create(plain: { kind: OpenDppEventType }) {
    return OpenEpcisEvent.fromPlain({
      ...plain,
    });
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
