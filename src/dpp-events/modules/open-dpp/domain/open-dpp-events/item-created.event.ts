import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { OpenDppEventType } from '../open-dpp-event-type.enum';
import { OpenDppEventData } from '../open-dpp-event-data';

export class ItemCreatedEvent extends OpenDppEventData {
  @Expose()
  readonly type: OpenDppEventType = OpenDppEventType.ITEM_CREATED;

  @Expose()
  readonly itemId: string;

  static create(plain?: { itemId?: string }) {
    return ItemCreatedEvent.fromPlain({
      itemId: plain?.itemId,
      type: OpenDppEventType.ITEM_CREATED,
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
