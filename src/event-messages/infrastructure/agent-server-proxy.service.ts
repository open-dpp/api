import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';

@Injectable()
export class AgentServerProxyService {
  constructor(@Inject('AGENT_SERVER') private client: ClientProxy) {}

  publishPassportCreatedEvent(
    organizationId: string,
    uniqueProductIdentifier: UniqueProductIdentifier,
  ) {
    this.client.emit('passport_created', {
      organizationId: organizationId,
      uuid: uniqueProductIdentifier.uuid,
    });
  }

  publishPassportUpdatedEvent(
    organizationId: string,
    uniqueProductIdentifier: UniqueProductIdentifier,
  ) {
    this.client.emit('passport_updated', {
      organizationId: organizationId,
      uuid: uniqueProductIdentifier.uuid,
    });
  }
}
