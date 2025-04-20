import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { OpenDppEventType } from './open-dpp-event-type.enum';

export class OpenDppEvent {
  @Expose()
  readonly id: string = randomUUID();

  @Expose()
  readonly type: OpenDppEventType;

  @Expose()
  readonly source: string;

  @Expose()
  readonly createdAt: Date = new Date();

  @Expose()
  readonly updatedAt: Date = new Date();

  static create(plain: {
    type: OpenDppEventType;
    source: string;
    eventJsonData: string;
  }) {
    return OpenDppEvent.fromPlain({
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
