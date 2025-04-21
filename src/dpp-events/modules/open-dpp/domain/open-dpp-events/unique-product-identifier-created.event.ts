import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { OpenDppEvent, OpenDppEventSchemaVersion } from '../open-dpp-event';
import { OpenDppEventType } from '../open-dpp-event-type.enum';

export enum UniqueProductIdentifierCreatedEventSchemaVersion {
  v1_0_0 = '1.0.0',
}

export class UniqueProductIdentifierCreatedEvent extends OpenDppEvent {
  @Expose()
  readonly uniqueProductIdentifierId: string;

  @Expose()
  readonly subSchemaVersion: UniqueProductIdentifierCreatedEventSchemaVersion;

  static create(plain: {
    schemaVersion?: OpenDppEventSchemaVersion;
    uniqueProductIdentifierId?: string;
    subSchemaVersion?: UniqueProductIdentifierCreatedEventSchemaVersion;
  }) {
    return UniqueProductIdentifierCreatedEvent.fromPlain({
      kind: OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
      schemaVersion: plain.schemaVersion,
      uniqueProductIdentifierId: plain.uniqueProductIdentifierId,
      subSchemaVersion: plain.subSchemaVersion,
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
