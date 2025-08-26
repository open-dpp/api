import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';

@Injectable()
export class AgentServerProxyService {
  private readonly logger = new Logger(AgentServerProxyService.name);

  constructor(@Inject('AGENT_SERVER') private client: ClientProxy) {}

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
      if (!uniqueProductIdentifier?.uuid) {
        this.logger.warn(
          `Skipping ${eventName}: missing UUID (organizationId=${organizationId})`,
        );
        continue;
      }
      this.client
        .emit(eventName, {
          organizationId,
          uuid: uniqueProductIdentifier.uuid,
        })
        .subscribe({
          error: (err) =>
            this.logger.error(`Failed to emit ${eventName}`, err as any),
        });
    }
  }
}
