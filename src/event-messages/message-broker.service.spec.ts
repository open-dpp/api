import { Test, TestingModule } from '@nestjs/testing';
import { MessageBrokerService } from './message-broker.service';
import { Kafka } from 'kafkajs';

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

  describe('sendPageViewEvent', () => {
    it('should send a properly formatted message to Kafka', async () => {
      // Mock the date for consistent testing
      const mockDate = new Date('2025-01-01T12:00:00Z');
      jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());

      const testData = {
        passportId: 'test-passport-id',
        modelId: 'test-model-id',
        templateId: 'test-template-id',
        organizationId: 'test-org-id',
        page: 'https://example.com/test-page',
      };

      await service.sendPageViewEvent(
        testData.passportId,
        testData.modelId,
        testData.templateId,
        testData.organizationId,
        testData.page,
      );

      const expectedMessage = JSON.stringify({
        id: testData.passportId,
        modelId: testData.modelId,
        templateId: testData.templateId,
        ownedByOrganizationId: testData.organizationId,
        page: testData.page,
        date: mockDate.toISOString(),
      });

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'page_viewed',
        messages: [{ value: expectedMessage }],
      });

      // Restore Date mock
      jest.restoreAllMocks();
    });

    it('should throw an error if producer.send fails', async () => {
      mockProducer.send.mockRejectedValueOnce(new Error('Kafka error'));

      await expect(
        service.sendPageViewEvent(
          'test-id',
          'test-model',
          'test-template',
          'test-org',
          'test-page',
        ),
      ).rejects.toThrow('Kafka error');
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
