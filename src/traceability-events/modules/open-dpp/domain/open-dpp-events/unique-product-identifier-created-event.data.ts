import { OpenDppEventType } from '../open-dpp-event-type.enum';
import { OpenDppEventData } from '../open-dpp-event-data';
import { OpenDppEvent } from '../open-dpp-event';

export class UniqueProductIdentifierCreatedEventData extends OpenDppEventData {
  private constructor(
    public readonly uniqueProductIdentifierId: string,
    public readonly type: OpenDppEventType = OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
  ) {
    super();
    this.uniqueProductIdentifierId = uniqueProductIdentifierId;
  }

  static createWithWrapper(data: {
    userId: string;
    itemId: string;
    organizationId: string;
    uniqueProductIdentifierId: string;
  }) {
    return OpenDppEvent.createWithWrapper({
      userId: data.userId,
      itemId: data.itemId,
      organizationId: data.organizationId,
      childData: new UniqueProductIdentifierCreatedEventData(
        data.uniqueProductIdentifierId,
      ),
    });
  }
}
