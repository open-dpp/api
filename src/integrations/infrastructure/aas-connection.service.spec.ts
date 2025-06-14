import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AasConnectionService } from './aas-connection.service';
import { AasConnectionDoc, AasConnectionSchema } from './aas-connection.schema';
import { AasConnection } from '../domain/aas-connection';
import { AssetAdministrationShellType } from '../domain/asset-administration-shell';

describe('AasMappingService', () => {
  let aasMappingService: AasConnectionService;
  const userId = randomUUID();
  const organizationId = randomUUID();
  let mongoConnection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: AasConnectionDoc.name,
            schema: AasConnectionSchema,
          },
        ]),
      ],
      providers: [AasConnectionService],
    }).compile();
    aasMappingService = module.get<AasConnectionService>(AasConnectionService);
    mongoConnection = module.get<Connection>(getConnectionToken());
  });

  it('fails if requested item could not be found', async () => {
    await expect(aasMappingService.findById(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(AasConnection.name),
    );
  });

  it('should create and find aas mapping', async () => {
    const dataModelId = randomUUID();
    const modelId = randomUUID();
    const fieldMappings = [
      {
        idShortParent: 'ProductCarbonFootprint_A1A3',
        idShort: 'PCFCO2eq',
        sectionId: 'internalSectionId',
        dataFieldId: 'internalField',
      },
      {
        idShortParent: 'ProductCarbonFootprint_A1A3',
        idShort: 'CCFCO2eq',
        sectionId: 'internalSectionId',
        dataFieldId: 'internalField2',
      },
    ];
    const aasMapping = AasConnection.create({
      organizationId,
      userId,
      dataModelId,
      modelId,
      aasType: AssetAdministrationShellType.Semitrailer_Truck,
    });
    aasMapping.addFieldAssignment(fieldMappings[0]);
    aasMapping.addFieldAssignment(fieldMappings[1]);

    const { id } = await aasMappingService.save(aasMapping);
    const foundAasMapping = await aasMappingService.findById(id);
    expect(foundAasMapping.dataModelId).toEqual(dataModelId);
    expect(foundAasMapping.modelId).toEqual(modelId);
    expect(foundAasMapping.aasType).toEqual(
      AssetAdministrationShellType.Semitrailer_Truck,
    );
    expect(foundAasMapping.fieldAssignments).toEqual(fieldMappings);
    expect(foundAasMapping.id).toEqual(id);
    expect(foundAasMapping.ownedByOrganizationId).toEqual(organizationId);
    expect(foundAasMapping.createdByUserId).toEqual(userId);
  });

  afterAll(async () => {
    await mongoConnection.close();
  });
});
