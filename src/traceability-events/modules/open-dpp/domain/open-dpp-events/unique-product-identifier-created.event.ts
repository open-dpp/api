import { Expose } from 'class-transformer';
import { OpenDppEventType } from '../open-dpp-event-type.enum';
import { OpenDppEventData } from '../open-dpp-event-data';

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

  static create(plain: { uniqueProductIdentifierId: string }) {
    return new UniqueProductIdentifierCreatedEvent(
      plain.uniqueProductIdentifierId,
    );
  }
}
