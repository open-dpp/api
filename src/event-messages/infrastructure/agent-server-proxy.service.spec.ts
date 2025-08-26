import { Test, TestingModule } from '@nestjs/testing';
import { AgentServerProxyService } from './agent-server-proxy.service';
import { ClientProxy } from '@nestjs/microservices';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { randomUUID } from 'crypto';

describe('AgentServerProxyService', () => {
  let agentServerProxyService: AgentServerProxyService;
  let client: ClientProxy;

  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AgentServerProxyService,
        {
          provide: 'AGENT_SERVER',
          useValue: {
            emit: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
          },
        },
      ],
    }).compile();
    client = module.get<ClientProxy>('AGENT_SERVER'); // token from provider
    agentServerProxyService = module.get<AgentServerProxyService>(
      AgentServerProxyService,
    );
  });

  it('should publish passport creation event', () => {
    const spy = jest
      .spyOn(client, 'emit')
      .mockImplementation(() => ({ subscribe: jest.fn() }) as any);
    const uniqueProductIdentifier = UniqueProductIdentifier.create({
      referenceId: randomUUID(),
    });
    agentServerProxyService.publishPassportCreatedEvent('orgaId', [
      uniqueProductIdentifier,
    ]);
    expect(spy).toHaveBeenCalledWith('passport_created', {
      organizationId: 'orgaId',
      uuid: uniqueProductIdentifier.uuid,
    });
  });

  it('should publish passport updated event', () => {
    const spy = jest
      .spyOn(client, 'emit')
      .mockImplementation(() => ({ subscribe: jest.fn() }) as any);
    const uniqueProductIdentifier = UniqueProductIdentifier.create({
      referenceId: randomUUID(),
    });
    agentServerProxyService.publishPassportUpdatedEvent('orgaId', [
      uniqueProductIdentifier,
    ]);
    expect(spy).toHaveBeenCalledWith('passport_updated', {
      organizationId: 'orgaId',
      uuid: uniqueProductIdentifier.uuid,
    });
  });

  afterAll(async () => {
    await module.close();
  });
});
