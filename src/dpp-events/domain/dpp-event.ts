import {
  ClassConstructor,
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { randomUUID } from 'crypto';
import { DppEventData } from './dpp-event-data';
import { OpenDppEvent } from '../modules/open-dpp/domain/open-dpp-event';
import { OpenEpcisEvent } from '../modules/openepcis-events/domain/openepcis-event';
import { UntpEvent } from '../modules/untp-events/domain/untp-event';
import { DppEventType } from './dpp-event-type.enum';
import { DppEventIdentifier } from './dpp-event-identifier';

export const dppEventDataTypes: Array<{
  value: ClassConstructor<DppEventData>;
  name: string;
}> = [
  {
    value: OpenDppEvent,
    name: DppEventType.OPEN_DPP,
  },
  {
    value: OpenEpcisEvent,
    name: DppEventType.OPENEPCIS,
  },
  {
    value: UntpEvent,
    name: DppEventType.UNTP,
  },
];

export class DppEvent {
  @Expose()
  readonly id: string = randomUUID();

  @Expose()
  readonly createdAt: Date = new Date();

  @Expose()
  readonly updatedAt: Date = new Date();

  @Expose()
  @Type(() => DppEventData, {
    discriminator: {
      property: 'type',
      subTypes: dppEventDataTypes,
    },
    keepDiscriminatorProperty: true,
  })
  readonly data: DppEventData;

  @Expose()
  readonly identifier: DppEventIdentifier;

  static create(plain: Partial<DppEvent>) {
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
