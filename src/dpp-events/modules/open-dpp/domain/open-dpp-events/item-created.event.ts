import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { OpenDppEvent } from '../open-dpp-event';
import { OpenDppEventType } from '../open-dpp-event-type.enum';

export class ItemCreatedEvent extends OpenDppEvent {
  @Expose()
  readonly subKind: OpenDppEventType = OpenDppEventType.ITEM_CREATED;

  @Expose()
  readonly itemId: string;

  static create(plain?: { itemId?: string }) {
    return ItemCreatedEvent.fromPlain({
      itemId: plain?.itemId,
      subKind: OpenDppEventType.ITEM_CREATED,
    });
  }

  static fromPlain(plain: unknown): ItemCreatedEvent {
    return plainToInstance(ItemCreatedEvent, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  toPlain() {
    return instanceToPlain(this);
  }
}
