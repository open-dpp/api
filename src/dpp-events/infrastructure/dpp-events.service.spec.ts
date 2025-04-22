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
import { OpenDppEventSchema } from '../modules/open-dpp/infrastructure/open-dpp-event.document';
import { OpenepcisEventSchema } from '../modules/openepcis-events/infrastructure/openepcis-event.document';
import { UntpEventSchema } from '../modules/untp-events/infrastructure/untp-event.document';

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
            discriminators: [
              {
                name: DppEventType.OPEN_DPP,
                schema: OpenDppEventSchema,
              },
              {
                name: DppEventType.OPENEPCIS,
                schema: OpenepcisEventSchema,
              },
              {
                name: DppEventType.UNTP,
                schema: UntpEventSchema,
              },
            ],
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
        kind: DppEventType.OPENEPCIS,
      } as DppEventDocument;

      // Act
      const result = service.convertToDomain(dppEventDoc);

      // Assert
      expect(result).toBeInstanceOf(DppEvent);
      expect(result.id).toBe(id);
      expect(result.kind).toBe(DppEventType.OPENEPCIS);
    });

    it('should convert a DppEventDocument with createdAt and updatedAt to a DppEvent domain object', () => {
      // Arrange
      const id = randomUUID();
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');
      const dppEventDoc = {
        _id: id,
        kind: DppEventType.OPENEPCIS,
        createdAt,
        updatedAt,
      } as DppEventDocument;

      // Act
      const result = service.convertToDomain(dppEventDoc);

      // Assert
      expect(result).toBeInstanceOf(DppEvent);
      expect(result.id).toBe(id);
      expect(result.kind).toBe(DppEventType.OPENEPCIS);
      expect(result.createdAt).toEqual(createdAt);
      expect(result.updatedAt).toEqual(updatedAt);
    });
  });

  describe('save', () => {
    it('should save a DppEvent and return the saved domain object', async () => {
      // Arrange
      const id = randomUUID();
      const dppEvent = DppEvent.fromPlain({
        id,
        kind: DppEventType.OPENEPCIS,
      });

      // Act
      const result = await service.save(dppEvent);

      // Assert
      expect(result).toBeInstanceOf(DppEvent);
      expect(result.id).toBe(id);
      expect(result.kind).toBe(DppEventType.OPENEPCIS);

      // Verify it was saved to the database
      const savedDoc = await dppEventModel.findOne({ _id: id }).exec();
      expect(savedDoc).toBeDefined();
      expect(savedDoc._id).toBe(id);
      expect(savedDoc.kind).toBe(DppEventType.OPENEPCIS);
    });

    it('should save a DppEvent with custom createdAt and updatedAt dates', async () => {
      // Arrange
      const id = randomUUID();
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');
      const dppEvent = DppEvent.fromPlain({
        id,
        kind: DppEventType.OPENEPCIS,
        createdAt,
        updatedAt,
      });

      // Act
      const result = await service.save(dppEvent);

      // Assert
      expect(result).toBeInstanceOf(DppEvent);
      expect(result.id).toBe(id);
      expect(result.kind).toBe(DppEventType.OPENEPCIS);
      expect(result.createdAt).toEqual(createdAt);
      // The updatedAt date should be updated to the current time
      expect(result.updatedAt).not.toEqual(updatedAt);

      // Verify it was saved to the database
      const savedDoc = await dppEventModel.findOne({ _id: id }).exec();
      expect(savedDoc).toBeDefined();
      expect(savedDoc._id).toBe(id);
      expect(savedDoc.kind).toBe(DppEventType.OPENEPCIS);
      expect(savedDoc.createdAt).toEqual(createdAt);
      // The updatedAt date should be updated to the current time
      expect(savedDoc.updatedAt).not.toEqual(updatedAt);
    });
  });

  describe('findById', () => {
    it('should find DppEvents by id', async () => {
      // Arrange
      const id = randomUUID();
      await dppEventModel.create({
        _id: id,
        kind: DppEventType.OPENEPCIS,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.findById(id);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(id);
      expect(result[0].kind).toBe(DppEventType.OPENEPCIS);
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
        kind,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await dppEventModel.create({
        _id: id2,
        kind,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.findByKind(kind);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].kind).toBe(kind);
      expect(result[1].kind).toBe(kind);

      // Verify both events were found
      const ids = result.map((event) => event.id);
      expect(ids).toContain(id1);
      expect(ids).toContain(id2);
    });

    it('should return an empty array if no DppEvents are found by kind', async () => {
      // Act
      const result = await service.findByKind('non-existent-type');

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
          kind: DppEventType.OPEN_DPP,
        });

        // Act
        await service.save(openDppEvent);

        // Assert
        const savedDoc = await dppEventModel.findOne({ _id: id }).exec();
        expect(savedDoc).toBeDefined();
        expect(savedDoc._id).toBe(id);
        expect(savedDoc.kind).toBe(DppEventType.OPEN_DPP);

        // Verify the document uses the correct discriminator
        const retrievedEvents = await service.findByKind(DppEventType.OPEN_DPP);
        expect(retrievedEvents).toHaveLength(1);
        expect(retrievedEvents[0].id).toBe(id);
        expect(retrievedEvents[0].kind).toBe(DppEventType.OPEN_DPP);
      });
    });

    describe('OpenepcisEvent discriminator', () => {
      it('should save and retrieve an OpenepcisEvent with proper discriminator', async () => {
        // Arrange
        const id = randomUUID();
        const openepcisEvent = DppEvent.fromPlain({
          id,
          kind: DppEventType.OPENEPCIS,
        });

        // Act
        await service.save(openepcisEvent);

        // Assert
        const savedDoc = await dppEventModel.findOne({ _id: id }).exec();
        expect(savedDoc).toBeDefined();
        expect(savedDoc._id).toBe(id);
        expect(savedDoc.kind).toBe(DppEventType.OPENEPCIS);

        // Verify the document uses the correct discriminator
        const retrievedEvents = await service.findByKind(
          DppEventType.OPENEPCIS,
        );
        expect(retrievedEvents).toHaveLength(1);
        expect(retrievedEvents[0].id).toBe(id);
        expect(retrievedEvents[0].kind).toBe(DppEventType.OPENEPCIS);
      });
    });

    describe('UntpEvent discriminator', () => {
      it('should save and retrieve a UntpEvent with proper discriminator', async () => {
        // Arrange
        const id = randomUUID();
        const untpEvent = DppEvent.fromPlain({
          id,
          kind: DppEventType.UNTP,
        });

        // Act
        await service.save(untpEvent);

        // Assert
        const savedDoc = await dppEventModel.findOne({ _id: id }).exec();
        expect(savedDoc).toBeDefined();
        expect(savedDoc._id).toBe(id);
        expect(savedDoc.kind).toBe(DppEventType.UNTP);

        // Verify the document uses the correct discriminator
        const retrievedEvents = await service.findByKind(DppEventType.UNTP);
        expect(retrievedEvents).toHaveLength(1);
        expect(retrievedEvents[0].id).toBe(id);
        expect(retrievedEvents[0].kind).toBe(DppEventType.UNTP);
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
            kind: DppEventType.OPEN_DPP,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: openepcisId,
            kind: DppEventType.OPENEPCIS,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: untpId,
            kind: DppEventType.UNTP,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);

        // Act & Assert
        // Check OpenDpp events
        const openDppEvents = await service.findByKind(DppEventType.OPEN_DPP);
        expect(openDppEvents).toHaveLength(1);
        expect(openDppEvents[0].id).toBe(openDppId);
        expect(openDppEvents[0].kind).toBe(DppEventType.OPEN_DPP);

        // Check Openepcis events
        const openepcisEvents = await service.findByKind(
          DppEventType.OPENEPCIS,
        );
        expect(openepcisEvents).toHaveLength(1);
        expect(openepcisEvents[0].id).toBe(openepcisId);
        expect(openepcisEvents[0].kind).toBe(DppEventType.OPENEPCIS);

        // Check Untp events
        const untpEvents = await service.findByKind(DppEventType.UNTP);
        expect(untpEvents).toHaveLength(1);
        expect(untpEvents[0].id).toBe(untpId);
        expect(untpEvents[0].kind).toBe(DppEventType.UNTP);

        // Verify we can get all events
        const allEvents = await dppEventModel.find().exec();
        expect(allEvents).toHaveLength(3);
      });
    });
  });
});
