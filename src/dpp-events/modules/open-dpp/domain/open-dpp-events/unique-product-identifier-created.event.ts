import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { OpenDppEvent } from '../open-dpp-event';
import { OpenDppEventType } from '../open-dpp-event-type.enum';

export class UniqueProductIdentifierCreatedEvent extends OpenDppEvent {
  @Expose()
  readonly subKind: OpenDppEventType =
    OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED;

  @Expose()
  readonly uniqueProductIdentifierId: string;

  static create(plain?: { uniqueProductIdentifierId?: string }) {
    return UniqueProductIdentifierCreatedEvent.fromPlain({
      uniqueProductIdentifierId: plain?.uniqueProductIdentifierId,
    });
  }

  static fromPlain(plain: unknown): UniqueProductIdentifierCreatedEvent {
    return plainToInstance(UniqueProductIdentifierCreatedEvent, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  toPlain() {
    return instanceToPlain(this);
  }
}
