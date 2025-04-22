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
import { DppEventIdentifierTypes } from '../domain/dpp-event-identifier-types.enum';

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
        data: {
          type: DppEventType.OPENEPCIS,
        },
        identifier: {
          type: DppEventIdentifierTypes.SYSTEM,
        },
      } as DppEventDocument;

      // Act
      const result = service.convertToDomain(dppEventDoc);

      // Assert
      expect(result).toBeInstanceOf(DppEvent);
      expect(result.id).toBe(id);
      expect(result.data.type).toBe(DppEventType.OPENEPCIS);
      expect(result.identifier.type).toBe(DppEventIdentifierTypes.SYSTEM);
    });

    it('should convert a DppEventDocument with createdAt and updatedAt to a DppEvent domain object', () => {
      // Arrange
      const id = randomUUID();
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');
      const dppEventDoc = {
        _id: id,
        createdAt,
        updatedAt,
        data: {
          type: DppEventType.OPENEPCIS,
        },
        identifier: {
          type: DppEventIdentifierTypes.SYSTEM,
        },
      } as DppEventDocument;

      // Act
      const result = service.convertToDomain(dppEventDoc);

      // Assert
      expect(result).toBeInstanceOf(DppEvent);
      expect(result.id).toBe(id);
      expect(result.data.type).toBe(DppEventType.OPENEPCIS);
      expect(result.createdAt).toEqual(createdAt);
      expect(result.updatedAt).toEqual(updatedAt);
      expect(result.identifier.type).toEqual(DppEventIdentifierTypes.SYSTEM);
    });
  });

  describe('save', () => {
    it('should save a DppEvent and return the saved domain object', async () => {
      // Arrange
      const id = randomUUID();
      const dppEvent = DppEvent.fromPlain({
        id,
        data: {
          type: DppEventType.OPENEPCIS,
        },
        identifier: {
          type: DppEventIdentifierTypes.SYSTEM,
        },
      });

      // Act
      const result = await service.create(dppEvent);

      // Assert
      expect(result).toBeInstanceOf(DppEvent);
      expect(result.id).toBe(id);
      expect(result.data.type).toBe(DppEventType.OPENEPCIS);
      expect(result.identifier.type).toBe(DppEventIdentifierTypes.SYSTEM);

      // Verify it was saved to the database
      const savedDoc = await dppEventModel.findOne({ _id: id }).exec();
      expect(savedDoc).toBeDefined();
      expect(savedDoc._id).toBe(id);
      expect(savedDoc.data.type).toBe(DppEventType.OPENEPCIS);
      expect(savedDoc.identifier.type).toBe(DppEventIdentifierTypes.SYSTEM);
    });

    it('should save a DppEvent with custom createdAt and updatedAt dates', async () => {
      // Arrange
      const id = randomUUID();
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');
      const dppEvent = DppEvent.fromPlain({
        id,
        data: {
          type: DppEventType.OPENEPCIS,
        },
        createdAt,
        updatedAt,
        identifier: {
          type: DppEventIdentifierTypes.SYSTEM,
        },
      });

      // Act
      const result = await service.create(dppEvent);

      // Assert
      expect(result).toBeInstanceOf(DppEvent);
      expect(result.id).toBe(id);
      expect(result.data.type).toBe(DppEventType.OPENEPCIS);
      expect(result.createdAt).toEqual(createdAt);
      // The updatedAt date should be updated to the current time
      expect(result.updatedAt).not.toEqual(updatedAt);
      expect(result.identifier.type).toEqual(DppEventIdentifierTypes.SYSTEM);

      // Verify it was saved to the database
      const savedDoc = await dppEventModel.findOne({ _id: id }).exec();
      expect(savedDoc).toBeDefined();
      expect(savedDoc._id).toBe(id);
      expect(savedDoc.data.type).toBe(DppEventType.OPENEPCIS);
      expect(savedDoc.createdAt).toEqual(createdAt);
      // The updatedAt date should be updated to the current time
      expect(savedDoc.updatedAt).not.toEqual(updatedAt);
      expect(savedDoc.identifier.type).toEqual(DppEventIdentifierTypes.SYSTEM);
    });
  });

  describe('findById', () => {
    it('should find DppEvents by id', async () => {
      // Arrange
      const id = randomUUID();
      await dppEventModel.create({
        _id: id,
        data: {
          type: DppEventType.OPENEPCIS,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        identifier: {
          type: DppEventIdentifierTypes.SYSTEM,
        },
      });

      // Act
      const result = await service.findById(id);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(id);
      expect(result[0].data.type).toBe(DppEventType.OPENEPCIS);
      expect(result[0].identifier.type).toBe(DppEventIdentifierTypes.SYSTEM);
    });

    it('should return an empty array if no DppEvents are found by id', async () => {
      // Act
      const result = await service.findById('non-existent-id');

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('findByKind', () => {
    it('should find DppEvents by kind', async () => {
      // Arrange
      const id1 = randomUUID();
      const id2 = randomUUID();
      const kind = DppEventType.OPENEPCIS;

      await dppEventModel.create({
        _id: id1,
        data: {
          type: DppEventType.OPENEPCIS,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        identifier: {
          type: DppEventIdentifierTypes.SYSTEM,
        },
      });

      await dppEventModel.create({
        _id: id2,
        data: {
          type: DppEventType.OPENEPCIS,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        identifier: {
          type: DppEventIdentifierTypes.SYSTEM,
        },
      });

      // Act
      const result = await service.findByDataType(kind);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].data.type).toBe(kind);
      expect(result[1].data.type).toBe(kind);
      expect(result[0].identifier.type).toBe(DppEventIdentifierTypes.SYSTEM);
      expect(result[1].identifier.type).toBe(DppEventIdentifierTypes.SYSTEM);

      // Verify both events were found
      const ids = result.map((event) => event.id);
      expect(ids).toContain(id1);
      expect(ids).toContain(id2);
    });

    it('should return an empty array if no DppEvents are found by kind', async () => {
      // Act
      const result = await service.findByDataType(undefined);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('DppEvent Discriminators', () => {
    describe('OpenDppEvent discriminator', () => {
      it('should save and retrieve an OpenDppEvent with proper discriminator', async () => {
        // Arrange
        const id = randomUUID();
        const openDppEvent = DppEvent.fromPlain({
          id,
          data: {
            type: DppEventType.OPEN_DPP,
          },
          identifier: {
            type: DppEventIdentifierTypes.SYSTEM,
          },
        });

        // Act
        await service.create(openDppEvent);

        // Assert
        const savedDoc = await dppEventModel.findOne({ _id: id }).exec();
        expect(savedDoc).toBeDefined();
        expect(savedDoc._id).toBe(id);
        expect(savedDoc.data.type).toBe(DppEventType.OPEN_DPP);
        expect(savedDoc.identifier.type).toBe(DppEventIdentifierTypes.SYSTEM);

        // Verify the document uses the correct discriminator
        const retrievedEvents = await service.findByDataType(
          DppEventType.OPEN_DPP,
        );
        expect(retrievedEvents).toHaveLength(1);
        expect(retrievedEvents[0].id).toBe(id);
        expect(retrievedEvents[0].data.type).toBe(DppEventType.OPEN_DPP);
        expect(retrievedEvents[0].identifier.type).toBe(
          DppEventIdentifierTypes.SYSTEM,
        );
      });
    });

    describe('OpenepcisEvent discriminator', () => {
      it('should save and retrieve an OpenepcisEvent with proper discriminator', async () => {
        // Arrange
        const id = randomUUID();
        const openepcisEvent = DppEvent.fromPlain({
          id,
          data: {
            type: DppEventType.OPENEPCIS,
          },
          identifier: {
            type: DppEventIdentifierTypes.SYSTEM,
          },
        });

        // Act
        await service.create(openepcisEvent);

        // Assert
        const savedDoc = await dppEventModel.findOne({ _id: id }).exec();
        expect(savedDoc).toBeDefined();
        expect(savedDoc._id).toBe(id);
        expect(savedDoc.data.type).toBe(DppEventType.OPENEPCIS);
        expect(savedDoc.identifier.type).toBe(DppEventIdentifierTypes.SYSTEM);

        // Verify the document uses the correct discriminator
        const retrievedEvents = await service.findByDataType(
          DppEventType.OPENEPCIS,
        );
        expect(retrievedEvents).toHaveLength(1);
        expect(retrievedEvents[0].id).toBe(id);
        expect(retrievedEvents[0].data.type).toBe(DppEventType.OPENEPCIS);
        expect(retrievedEvents[0].identifier.type).toBe(
          DppEventIdentifierTypes.SYSTEM,
        );
      });
    });

    describe('UntpEvent discriminator', () => {
      it('should save and retrieve a UntpEvent with proper discriminator', async () => {
        // Arrange
        const id = randomUUID();
        const untpEvent = DppEvent.fromPlain({
          id,
          data: {
            type: DppEventType.UNTP,
          },
          identifier: {
            type: DppEventIdentifierTypes.SYSTEM,
          },
        });

        // Act
        await service.create(untpEvent);

        // Assert
        const savedDoc = await dppEventModel.findOne({ _id: id }).exec();
        expect(savedDoc).toBeDefined();
        expect(savedDoc._id).toBe(id);
        expect(savedDoc.data.type).toBe(DppEventType.UNTP);
        expect(savedDoc.identifier.type).toBe(DppEventIdentifierTypes.SYSTEM);

        // Verify the document uses the correct discriminator
        const retrievedEvents = await service.findByDataType(DppEventType.UNTP);
        expect(retrievedEvents).toHaveLength(1);
        expect(retrievedEvents[0].id).toBe(id);
        expect(retrievedEvents[0].data.type).toBe(DppEventType.UNTP);
        expect(retrievedEvents[0].identifier.type).toBe(
          DppEventIdentifierTypes.SYSTEM,
        );
      });
    });

    describe('Mixed discriminators', () => {
      it('should correctly retrieve events by their discriminator type', async () => {
        // Arrange
        const openDppId = randomUUID();
        const openepcisId = randomUUID();
        const untpId = randomUUID();

        // Create one of each event type
        await dppEventModel.create([
          {
            _id: openDppId,
            data: {
              type: DppEventType.OPEN_DPP,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            identifier: {
              type: DppEventIdentifierTypes.SYSTEM,
            },
          },
          {
            _id: openepcisId,
            data: {
              type: DppEventType.OPENEPCIS,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            identifier: {
              type: DppEventIdentifierTypes.SYSTEM,
            },
          },
          {
            _id: untpId,
            data: {
              type: DppEventType.UNTP,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            identifier: {
              type: DppEventIdentifierTypes.SYSTEM,
            },
          },
        ]);

        // Act & Assert
        // Check OpenDpp events
        const openDppEvents = await service.findByDataType(
          DppEventType.OPEN_DPP,
        );
        expect(openDppEvents).toHaveLength(1);
        expect(openDppEvents[0].id).toBe(openDppId);
        expect(openDppEvents[0].data.type).toBe(DppEventType.OPEN_DPP);
        expect(openDppEvents[0].identifier.type).toBe(
          DppEventIdentifierTypes.SYSTEM,
        );

        // Check Openepcis events
        const openepcisEvents = await service.findByDataType(
          DppEventType.OPENEPCIS,
        );
        expect(openepcisEvents).toHaveLength(1);
        expect(openepcisEvents[0].id).toBe(openepcisId);
        expect(openepcisEvents[0].data.type).toBe(DppEventType.OPENEPCIS);
        expect(openDppEvents[0].identifier.type).toBe(
          DppEventIdentifierTypes.SYSTEM,
        );

        // Check Untp events
        const untpEvents = await service.findByDataType(DppEventType.UNTP);
        expect(untpEvents).toHaveLength(1);
        expect(untpEvents[0].id).toBe(untpId);
        expect(untpEvents[0].data.type).toBe(DppEventType.UNTP);
        expect(openDppEvents[0].identifier.type).toBe(
          DppEventIdentifierTypes.SYSTEM,
        );

        // Verify we can get all events
        const allEvents = await dppEventModel.find().exec();
        expect(allEvents).toHaveLength(3);
      });
    });
  });
});
