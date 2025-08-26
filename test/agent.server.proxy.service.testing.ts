import { Injectable } from '@nestjs/common';
import { UniqueProductIdentifier } from '../src/unique-product-identifier/domain/unique.product.identifier';

@Injectable()
export class AgentServerProxyServiceTesting {
  public readonly messages = { passport_created: [], passport_updated: [] };
  constructor() {}

  publishPassportCreatedEvent(
    organizationId: string,
    uniqueProductIdentifiers: UniqueProductIdentifier[],
  ) {
    this.publishPassportEvent(
      organizationId,
      uniqueProductIdentifiers,
      'passport_created',
    );
  }

  publishPassportUpdatedEvent(
    organizationId: string,
    uniqueProductIdentifiers: UniqueProductIdentifier[],
  ) {
    this.publishPassportEvent(
      organizationId,
      uniqueProductIdentifiers,
      'passport_updated',
    );
  }

  private publishPassportEvent(
    organizationId: string,
    uniqueProductIdentifiers: UniqueProductIdentifier[],
    eventName: string,
  ) {
    for (const uniqueProductIdentifier of uniqueProductIdentifiers) {
      this.messages[eventName].push({
        organizationId,
        uuid: uniqueProductIdentifier.uuid,
      });
    }
  }
}
