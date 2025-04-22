import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { DppEventData } from './dpp-event-data';

export class DppEvent {
  @Expose()
  readonly id: string = randomUUID();

  @Expose()
  readonly createdAt: Date = new Date();

  @Expose()
  readonly updatedAt: Date = new Date();

  @Expose()
  readonly data: DppEventData;

  static create(plain: { data: DppEventData }) {
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
