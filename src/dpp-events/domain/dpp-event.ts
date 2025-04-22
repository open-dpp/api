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
import { DppEventIdentifierTypes } from './dpp-event-identifier-types.enum';
import { DppEventIdentifierUser } from './dpp-event-identifier-user';
import { DppEventIdentifierSystem } from './dpp-event-identifier-system';
import { DppEventIdentifierAnonymous } from './dpp-event-identifier-anonymous';

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

export const dppEventIdentifierTypes: Array<{
  value: ClassConstructor<DppEventIdentifier>;
  name: string;
}> = [
  {
    value: DppEventIdentifierUser,
    name: DppEventIdentifierTypes.USER,
  },
  {
    value: DppEventIdentifierSystem,
    name: DppEventIdentifierTypes.SYSTEM,
  },
  {
    value: DppEventIdentifierAnonymous,
    name: DppEventIdentifierTypes.USER,
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
  @Type(() => DppEventIdentifier, {
    discriminator: {
      property: 'type',
      subTypes: dppEventIdentifierTypes,
    },
    keepDiscriminatorProperty: true,
  })
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
