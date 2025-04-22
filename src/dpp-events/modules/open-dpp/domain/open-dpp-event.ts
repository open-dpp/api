import {
  ClassConstructor,
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { DppEventType } from '../../../domain/dpp-event-type.enum';
import { DppEventData } from '../../../domain/dpp-event-data';
import { OpenDppEventData } from './open-dpp-event-data';
import { ItemCreatedEvent } from './open-dpp-events/item-created.event';
import { OpenDppEventType } from './open-dpp-event-type.enum';
import { UniqueProductIdentifierCreatedEvent } from './open-dpp-events/unique-product-identifier-created.event';

export const openDppEventDataTypes: Array<{
  value: ClassConstructor<OpenDppEventData>;
  name: string;
}> = [
  {
    value: ItemCreatedEvent,
    name: OpenDppEventType.ITEM_CREATED,
  },
  {
    value: UniqueProductIdentifierCreatedEvent,
    name: OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
  },
];

export class OpenDppEvent extends DppEventData {
  readonly type: DppEventType = DppEventType.OPEN_DPP;

  @Expose()
  @Type(() => DppEventData, {
    discriminator: {
      property: 'type',
      subTypes: openDppEventDataTypes,
    },
    keepDiscriminatorProperty: true,
  })
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
