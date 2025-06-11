import { Expose } from 'class-transformer';
import { OpenDppEventType } from '../open-dpp-event-type.enum';
import { OpenDppEventData } from '../open-dpp-event-data';

export class ItemCreatedEvent extends OpenDppEventData {
  @Expose()
  readonly type: OpenDppEventType = OpenDppEventType.ITEM_CREATED;

  @Expose()
  readonly itemId: string;

  private constructor(itemId: string) {
    super();
    this.itemId = itemId;
  }

  static create(plain: { itemId: string }) {
    return new ItemCreatedEvent(plain?.itemId);
  }
}
