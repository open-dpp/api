import { Test, TestingModule } from '@nestjs/testing';
import { DppEventsService } from './dpp-events.service';
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { DppEventDocument, DppEventSchema } from './dpp-event.document';
import { DppEvent } from '../domain/dpp-event';
import { DppEventType } from '../domain/dpp-event-type.enum';
import { randomUUID } from 'crypto';

describe('DppEventsService', () => {
  let service: DppEventsService;
  let mongoConnection: Connection;
  let dppEventModel: Model<DppEventDocument>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: DppEventDocument.name,
            schema: DppEventSchema,
          },
        ]),
      ],
      providers: [DppEventsService],
    }).compile();

    service = module.get<DppEventsService>(DppEventsService);
    mongoConnection = module.get<Connection>(getConnectionToken());
    dppEventModel = module.get<Model<DppEventDocument>>(
      getModelToken(DppEventDocument.name),
    );
  });

  afterEach(async () => {
    // Clean up the database after each test
    await dppEventModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoConnection.close(); // Close connection after tests
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convertToDomain', () => {
    it('should convert a DppEventDocument to a DppEvent domain object', () => {
      // Arrange
      const id = randomUUID();
      const dppEventDoc = {
        _id: id,
        type: DppEventType.OPENEPCIS_V3_0,
        dppId: 'dpp123',
      } as DppEventDocument;

      // Act
      const result = service.convertToDomain(dppEventDoc);

      // Assert
      expect(result).toBeInstanceOf(DppEvent);
      expect(result.id).toBe(id);
      expect(result.type).toBe(DppEventType.OPENEPCIS_V3_0);
      expect(result.dppId).toBe('dpp123');
    });
  });

  describe('save', () => {
    it('should save a DppEvent and return the saved domain object', async () => {
      // Arrange
      const id = randomUUID();
      const dppEvent = DppEvent.fromPlain({
        id,
        type: DppEventType.OPENEPCIS_V3_0,
        dppId: 'dpp123',
      });

      // Act
      const result = await service.save(dppEvent);

      // Assert
      expect(result).toBeInstanceOf(DppEvent);
      expect(result.id).toBe(id);
      expect(result.type).toBe(DppEventType.OPENEPCIS_V3_0);
      expect(result.dppId).toBe('dpp123');

      // Verify it was saved to the database
      const savedDoc = await dppEventModel.findOne({ _id: id }).exec();
      expect(savedDoc).toBeDefined();
      expect(savedDoc._id).toBe(id);
      expect(savedDoc.type).toBe(DppEventType.OPENEPCIS_V3_0);
      expect(savedDoc.dppId).toBe('dpp123');
    });

    it('should update an existing DppEvent if it exists', async () => {
      // Arrange
      const id = randomUUID();

      // Create initial document
      await dppEventModel.create({
        _id: id,
        type: DppEventType.OPENEPCIS_V3_0,
        dppId: 'dpp123',
      });

      // Create an updated event
      const updatedDppEvent = DppEvent.fromPlain({
        id,
        type: DppEventType.UNTP,
        dppId: 'dpp456',
      });

      // Act
      const result = await service.save(updatedDppEvent);

      // Assert
      expect(result).toBeInstanceOf(DppEvent);
      expect(result.id).toBe(id);
      expect(result.type).toBe(DppEventType.UNTP);
      expect(result.dppId).toBe('dpp456');

      // Verify it was updated in the database
      const updatedDoc = await dppEventModel.findOne({ _id: id }).exec();
      expect(updatedDoc).toBeDefined();
      expect(updatedDoc._id).toBe(id);
      expect(updatedDoc.type).toBe(DppEventType.UNTP);
      expect(updatedDoc.dppId).toBe('dpp456');
    });
  });

  describe('findById', () => {
    it('should find DppEvents by id', async () => {
      // Arrange
      const id = randomUUID();
      await dppEventModel.create({
        _id: id,
        type: DppEventType.OPENEPCIS_V3_0,
        dppId: 'dpp123',
      });

      // Act
      const result = await service.findById(id);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(id);
      expect(result[0].type).toBe(DppEventType.OPENEPCIS_V3_0);
      expect(result[0].dppId).toBe('dpp123');
    });

    it('should return an empty array if no DppEvents are found by id', async () => {
      // Act
      const result = await service.findById('non-existent-id');

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('findByDppId', () => {
    it('should find DppEvents by dppId', async () => {
      // Arrange
      const id1 = randomUUID();
      const id2 = randomUUID();
      const dppId = 'dpp123';

      await dppEventModel.create({
        _id: id1,
        type: DppEventType.OPENEPCIS_V3_0,
        dppId,
      });

      await dppEventModel.create({
        _id: id2,
        type: DppEventType.UNTP,
        dppId,
      });

      // Act
      const result = await service.findByDppId(dppId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].dppId).toBe(dppId);
      expect(result[1].dppId).toBe(dppId);

      // Verify both events were found
      const ids = result.map((event) => event.id);
      expect(ids).toContain(id1);
      expect(ids).toContain(id2);

      // Verify types are correct
      const types = result.map((event) => event.type);
      expect(types).toContain(DppEventType.OPENEPCIS_V3_0);
      expect(types).toContain(DppEventType.UNTP);
    });

    it('should return an empty array if no DppEvents are found by dppId', async () => {
      // Act
      const result = await service.findByDppId('non-existent-dppId');

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('findByType', () => {
    it('should find DppEvents by type', async () => {
      // Arrange
      const id1 = randomUUID();
      const id2 = randomUUID();
      const type = DppEventType.OPENEPCIS_V3_0;

      await dppEventModel.create({
        _id: id1,
        type,
        dppId: 'dpp123',
      });

      await dppEventModel.create({
        _id: id2,
        type,
        dppId: 'dpp456',
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
      const dppIds = result.map((event) => event.dppId);
      expect(dppIds).toContain('dpp123');
      expect(dppIds).toContain('dpp456');
    });

    it('should return an empty array if no DppEvents are found by type', async () => {
      // Act
      const result = await service.findByType('non-existent-type');

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});
