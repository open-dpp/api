import { Expose } from 'class-transformer';
import { OpenDppEventType } from '../open-dpp-event-type.enum';
import { OpenDppEventData } from '../open-dpp-event-data';
import { OpenDppEvent } from '../open-dpp-event';

export class ItemCreatedEvent extends OpenDppEventData {
  @Expose()
  readonly type: OpenDppEventType = OpenDppEventType.ITEM_CREATED;

  @Expose()
  readonly itemId: string;

  private constructor(itemId: string) {
    super();
    this.itemId = itemId;
  }

  static create(data: {
    userId: string;
    itemId: string;
    organizationId: string;
  }) {
    return OpenDppEvent.create({
      userId: data.userId,
      itemId: data.itemId,
      organizationId: data.organizationId,
      childData: new ItemCreatedEvent(data.itemId),
    });
  }
}
