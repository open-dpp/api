import { Test, TestingModule } from '@nestjs/testing';
import { OpenDppEventsService } from './open-dpp-events.service';
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { MongooseTestingModule } from '../../../../../test/mongo.testing.module';
import {
  OpenDppEventDocument,
  OpenDppEventSchema,
} from './open-dpp-event.document';
import { randomUUID } from 'crypto';
import { OpenDppEventType } from '../domain/open-dpp-event-type.enum';
import { OpenDppEvent } from '../domain/open-dpp-event';

describe('OpenDppEventsService', () => {
  let service: OpenDppEventsService;
  let mongoConnection: Connection;
  let openDppEventDocumentModel: Model<OpenDppEventDocument>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: OpenDppEventDocument.name,
            schema: OpenDppEventSchema,
          },
        ]),
      ],
      providers: [OpenDppEventsService],
    }).compile();

    service = module.get<OpenDppEventsService>(OpenDppEventsService);
    mongoConnection = module.get<Connection>(getConnectionToken());
    openDppEventDocumentModel = module.get<Model<OpenDppEventDocument>>(
      getModelToken(OpenDppEventDocument.name),
    );
  });

  afterEach(async () => {
    // Clean up the database after each test
    await openDppEventDocumentModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoConnection.close(); // Close connection after tests
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convertToDomain', () => {
    it('should convert a OpenDppEventDocument to a DppEvent domain object', () => {
      // Arrange
      const id = randomUUID();
      const openDppEventDocument = {
        _id: id,
        type: OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
        source: 'dpp123',
      } as OpenDppEventDocument;

      // Act
      const result = service.convertToDomain(openDppEventDocument);

      // Assert
      expect(result).toBeInstanceOf(OpenDppEvent);
      expect(result.id).toBe(id);
      expect(result.type).toBe(
        OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
      );
      expect(result.source).toBe('dpp123');
    });
  });

  describe('save', () => {
    it('should save a OpenDppEvent and return the saved domain object', async () => {
      // Arrange
      const id = randomUUID();
      const openDppEvent = OpenDppEvent.fromPlain({
        id,
        type: OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
        source: 'dpp123',
      });

      // Act
      const result = await service.save(openDppEvent);

      // Assert
      expect(result).toBeInstanceOf(OpenDppEvent);
      expect(result.id).toBe(id);
      expect(result.type).toBe(
        OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
      );
      expect(result.source).toBe('dpp123');

      // Verify it was saved to the database
      const savedDoc = await openDppEventDocumentModel
        .findOne({ _id: id })
        .exec();
      expect(savedDoc).toBeDefined();
      expect(savedDoc._id).toBe(id);
      expect(savedDoc.type).toBe(
        OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
      );
      expect(savedDoc.source).toBe('dpp123');
    });

    it('should update an existing OpenDppEvent if it exists', async () => {
      // Arrange
      const id = randomUUID();

      // Create initial document
      await openDppEventDocumentModel.create({
        _id: id,
        type: OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
        source: 'dpp123',
        eventJsonData: { data: 'test data' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create an updated event
      const updatedOpenDppEvent = OpenDppEvent.fromPlain({
        id,
        type: OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
        source: 'dpp456',
      });

      // Act
      const result = await service.save(updatedOpenDppEvent);

      // Assert
      expect(result).toBeInstanceOf(OpenDppEvent);
      expect(result.id).toBe(id);
      expect(result.type).toBe(
        OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
      );
      expect(result.source).toBe('dpp456');

      // Verify it was updated in the database
      const updatedDoc = await openDppEventDocumentModel
        .findOne({ _id: id })
        .exec();
      expect(updatedDoc).toBeDefined();
      expect(updatedDoc._id).toBe(id);
      expect(updatedDoc.type).toBe(
        OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
      );
      expect(updatedDoc.source).toBe('dpp456');
    });
  });

  describe('findById', () => {
    it('should find OpenDppEvents by id', async () => {
      // Arrange
      const id = randomUUID();
      await openDppEventDocumentModel.create({
        _id: id,
        type: OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
        source: 'dpp123',
        eventJsonData: { data: 'test data' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.findById(id);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(id);
      expect(result[0].type).toBe(
        OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
      );
      expect(result[0].source).toBe('dpp123');
    });

    it('should return an empty array if no OpenDppEvents are found by id', async () => {
      // Act
      const result = await service.findById('non-existent-id');

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('findByDppId', () => {
    it('should find OpenDppEvents by dppId', async () => {
      // Arrange
      const id1 = randomUUID();
      const id2 = randomUUID();
      const dppId = 'dpp123';

      await openDppEventDocumentModel.create({
        _id: id1,
        type: OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
        source: dppId,
        eventJsonData: { data: 'test data 1' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await openDppEventDocumentModel.create({
        _id: id2,
        type: OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
        source: dppId,
        eventJsonData: { data: 'test data 2' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.findByDppId(dppId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].source).toBe(dppId);
      expect(result[1].source).toBe(dppId);

      // Verify both events were found
      const ids = result.map((event) => event.id);
      expect(ids).toContain(id1);
      expect(ids).toContain(id2);

      // Verify types are correct
      const types = result.map((event) => event.type);
      expect(types).toContain(
        OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
      );
      expect(types).toContain(
        OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED,
      );
    });

    it('should return an empty array if no OpenDppEvents are found by dppId', async () => {
      // Act
      const result = await service.findByDppId('non-existent-dppId');

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('findByType', () => {
    it('should find OpenDppEvents by type', async () => {
      // Arrange
      const id1 = randomUUID();
      const id2 = randomUUID();
      const type = OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED;

      await openDppEventDocumentModel.create({
        _id: id1,
        type,
        source: 'dpp123',
        eventJsonData: { data: 'test data 1' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await openDppEventDocumentModel.create({
        _id: id2,
        type,
        source: 'dpp456',
        eventJsonData: { data: 'test data 2' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.findByType(type);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe(type);
      expect(result[1].type).toBe(type);

      // Verify both events were found
      const ids = result.map((event) => event.id);
      expect(ids).toContain(id1);
      expect(ids).toContain(id2);

      // Verify dppIds are correct
      const dppIds = result.map((event) => event.source);
      expect(dppIds).toContain('dpp123');
      expect(dppIds).toContain('dpp456');
    });

    it('should return an empty array if no OpenDppEvents are found by type', async () => {
      // Act
      const result = await service.findByType('non-existent-type');

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});
