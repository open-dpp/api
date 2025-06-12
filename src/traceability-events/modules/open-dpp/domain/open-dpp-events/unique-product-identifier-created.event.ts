import { Expose } from 'class-transformer';
import { OpenDppEventType } from '../open-dpp-event-type.enum';
import { OpenDppEventData } from '../open-dpp-event-data';
import { OpenDppEvent } from '../open-dpp-event';

export class UniqueProductIdentifierCreatedEvent extends OpenDppEventData {
  @Expose()
  readonly type: OpenDppEventType =
    OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED;

  @Expose()
  readonly uniqueProductIdentifierId: string;

  private constructor(uniqueProductIdentifierId: string) {
    super();
    this.uniqueProductIdentifierId = uniqueProductIdentifierId;
  }

  static create(data: {
    userId: string;
    itemId: string;
    organizationId: string;
    uniqueProductIdentifierId: string;
  }) {
    return OpenDppEvent.create({
      userId: data.userId,
      itemId: data.itemId,
      organizationId: data.organizationId,
      childData: new UniqueProductIdentifierCreatedEvent(
        data.uniqueProductIdentifierId,
      ),
    });
  }
}
