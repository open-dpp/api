import { Test, TestingModule } from '@nestjs/testing';
import { MessageBrokerService } from './message-broker.service';
import { Kafka } from 'kafkajs';
import { Item } from '../items/domain/item';
import { phoneItemFactory } from '../product-passport/fixtures/product-passport.factory';

jest.mock('kafkajs');

describe('MessageBrokerService', () => {
  let service: MessageBrokerService;
  let mockProducer: any;

  beforeEach(async () => {
    mockProducer = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn(),
    };

    (Kafka as jest.Mock).mockImplementation(() => ({
      producer: () => mockProducer,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageBrokerService],
    }).compile();

    service = module.get<MessageBrokerService>(MessageBrokerService);
    await service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
    jest.clearAllMocks();
  });

  describe('emitItemUpdated', () => {
    it('should emit a properly formatted message to message broker', async () => {
      // Mock the date for consistent testing
      const mockDate = new Date('2025-01-01T12:00:00Z');
      jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());

      const item = Item.loadFromDb(phoneItemFactory.addDataValues().build());

      await service.emitItemUpdated(item);

      const expectedMessage = JSON.stringify({
        modelId: item.modelId,
        templateId: item.templateId,
        organizationId: item.ownedByOrganizationId,
        fieldValues: item.dataValues.map((value) => ({
          dataSectionId: value.dataSectionId,
          dataFieldId: value.dataFieldId,
          value: value.value,
          row: value.row,
        })),
        date: item.createdAt.toISOString(),
      });

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'item_updated',
        messages: [{ value: expectedMessage }],
      });

      // Restore Date mock
      jest.restoreAllMocks();
    });

    it('should throw an error if producer.send fails', async () => {
      mockProducer.send.mockRejectedValueOnce(new Error('Kafka error'));

      const item = Item.loadFromDb(phoneItemFactory.addDataValues().build());

      await expect(service.emitItemUpdated(item)).rejects.toThrow(
        'Kafka error',
      );
    });
  });

  describe('lifecycle hooks', () => {
    it('should connect producer on module init', async () => {
      expect(mockProducer.connect).toHaveBeenCalled();
    });

    it('should disconnect producer on module destroy', async () => {
      await service.onModuleDestroy();
      expect(mockProducer.disconnect).toHaveBeenCalled();
    });
  });
});
