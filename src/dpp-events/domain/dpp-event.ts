import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { DppEventType } from './dpp-event-type.enum';

export class DppEvent {
  @Expose()
  readonly id: string = randomUUID();

  @Expose()
  readonly type: DppEventType;

  @Expose()
  readonly dppId: string;

  @Expose()
  readonly eventJsonData: string;

  static create(plain: {
    type: DppEventType;
    dppId: string;
    eventJsonData: string;
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
