import { AasConnection, AasFieldAssignment } from './aas-connection';
import { ignoreIds } from '../../../test/utils';
import { DataValue } from '../../product-passport/domain/data-value';
import {
  AssetAdministrationShell,
  AssetAdministrationShellType,
} from './asset-administration-shell';
import { semitrailerTruckAas } from './semitrailer-truck-aas';
import { Model } from '../../models/domain/model';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { User } from '../../users/domain/user';
import { Organization } from '../../organizations/domain/organization';
import { randomUUID } from 'crypto';
import { SectionType } from '../../data-modelling/domain/section-base';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';

describe('AasMapping', () => {
  const organizationId = randomUUID();
  const userId = randomUUID();
  it('should create field mapping', () => {
    const fieldMapping = AasFieldAssignment.create({
      dataFieldId: 'internalField',
      sectionId: 'internalSectionId',
      idShortParent: 'externalFieldParent',
      idShort: 'externalField',
    });
    expect(fieldMapping.dataFieldId).toEqual('internalField');
    expect(fieldMapping.sectionId).toEqual('internalSectionId');
    expect(fieldMapping.idShort).toEqual('externalField');
    expect(fieldMapping.idShortParent).toEqual('externalFieldParent');
  });

  it('should create aas mapping and add field mappings', () => {
    const dataModelId = 'dataModelId';
    const modelId = 'modelId';
    const name = 'Connection Name';

    const aasConnection = AasConnection.create({
      name,
      organizationId,
      userId,
      dataModelId,
      modelId,
      aasType: AssetAdministrationShellType.Semitrailer_Truck,
    });
    expect(aasConnection.id).toEqual(expect.any(String));
    expect(aasConnection.name).toEqual(name);
    expect(aasConnection.isOwnedBy(organizationId)).toBeTruthy();
    expect(aasConnection.createdByUserId).toEqual(userId);
    expect(aasConnection.dataModelId).toEqual(dataModelId);
    expect(aasConnection.modelId).toEqual(modelId);
    expect(aasConnection.fieldAssignments).toEqual([]);
    const fieldMapping = AasFieldAssignment.create({
      dataFieldId: 'internalField',
      sectionId: 'internalSectionId',
      idShortParent: 'externalFieldParent',
      idShort: 'externalField',
    });
    aasConnection.addFieldAssignment(fieldMapping);
    expect(aasConnection.fieldAssignments).toEqual([fieldMapping]);
  });

  it('should assign model', () => {
    const dataModelId = 'dataModelId';
    const modelId = 'modelId';
    const aasConnection = AasConnection.create({
      name: 'Connection Name',
      organizationId,
      userId,
      dataModelId,
      modelId,
      aasType: AssetAdministrationShellType.Semitrailer_Truck,
    });
    const model = Model.create({
      organizationId: 'organizationId',
      userId: 'userId',
      name: 'modelName',
    });
    const user = new User('userId', 'email');
    const organization = Organization.create({
      name: 'organizationName',
      user,
    });
    const productDataModel = ProductDataModel.create({
      organization: organization,
      user: user,
      name: 'data model',
    });
    model.assignProductDataModel(productDataModel);
    aasConnection.assignModel(model);
    expect(aasConnection.dataModelId).toEqual(productDataModel.id);
    expect(aasConnection.modelId).toEqual(model.id);
  });

  it('should replace field assignments', () => {
    const dataModelId = 'dataModelId';
    const modelId = 'modelId';
    const aasConnection = AasConnection.create({
      name: 'Connection Name',
      organizationId,
      userId,
      dataModelId,
      modelId,
      aasType: AssetAdministrationShellType.Semitrailer_Truck,
    });
    const fieldAssignment = AasFieldAssignment.create({
      dataFieldId: 'internalField',
      sectionId: 'internalSectionId',
      idShortParent: 'externalFieldParent',
      idShort: 'externalField',
    });
    aasConnection.addFieldAssignment(fieldAssignment);

    const newFieldAssignments = [
      AasFieldAssignment.create({
        dataFieldId: 'internalField2',
        sectionId: 'internalSectionId2',
        idShortParent: 'externalFieldParent2',
        idShort: 'externalField2',
      }),
      AasFieldAssignment.create({
        dataFieldId: 'internalField3',
        sectionId: 'internalSectionId3',
        idShortParent: 'externalFieldParent3',
        idShort: 'externalField3',
      }),
    ];
    aasConnection.replaceFieldAssignments(newFieldAssignments);
    expect(aasConnection.fieldAssignments).toEqual(newFieldAssignments);
  });

  it('should generate data values for semi trailer', () => {
    const dataModelId = 'dataModelId';
    const modelId = 'modelId';
    const aasConnection = AasConnection.create({
      name: 'Connection Name',
      organizationId,
      userId,
      dataModelId,
      modelId,
      aasType: AssetAdministrationShellType.Semitrailer_Truck,
    });

    const sectionId1 = randomUUID();
    const sectionId2 = randomUUID();
    const dataFieldId1 = randomUUID();
    const dataFieldId2 = randomUUID();
    const dataFieldId3 = randomUUID();

    const laptopModel = {
      name: 'Laptop',
      version: '1.0',
      ownedByOrganizationId: randomUUID(),
      createdByUserId: randomUUID(),
      sections: [
        {
          id: sectionId1,
          name: 'Section name',
          type: SectionType.GROUP,
          layout: {
            cols: { sm: 2 },
            colStart: { sm: 1 },
            colSpan: { sm: 2 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          },
          dataFields: [
            {
              id: dataFieldId1,
              type: 'TextField',
              name: 'Title',
              options: { min: 2 },
              layout: {
                colStart: { sm: 1 },
                colSpan: { sm: 2 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              },
              granularityLevel: GranularityLevel.ITEM,
            },
            {
              id: dataFieldId2,
              type: 'TextField',
              name: 'Title 2',
              options: { min: 7 },
              layout: {
                colStart: { sm: 1 },
                colSpan: { sm: 2 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              },
              granularityLevel: GranularityLevel.ITEM,
            },
          ],
        },
        {
          id: sectionId2,
          name: 'Section name 2',
          type: SectionType.GROUP,
          layout: {
            cols: { sm: 2 },
            colStart: { sm: 1 },
            colSpan: { sm: 2 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          },
          dataFields: [
            {
              id: dataFieldId3,
              type: 'NumericField',
              name: 'Title 3',
              options: { min: 8 },
              layout: {
                colStart: { sm: 1 },
                colSpan: { sm: 2 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              },
              granularityLevel: GranularityLevel.ITEM,
            },
          ],
        },
      ],
    };

    const productDataModel = ProductDataModel.fromPlain(laptopModel);

    const fieldAssignment1 = AasFieldAssignment.create({
      dataFieldId: dataFieldId3,
      sectionId: sectionId2,
      idShortParent: 'ProductCarbonFootprint_A1A3',
      idShort: 'PCFCO2eq',
    });
    const fieldAssignment2 = AasFieldAssignment.create({
      dataFieldId: dataFieldId2,
      sectionId: sectionId1,
      idShortParent: 'ProductCarbonFootprint_A1A3',
      idShort: 'PCFCalculationMethod',
    });
    aasConnection.addFieldAssignment(fieldAssignment1);
    aasConnection.addFieldAssignment(fieldAssignment2);

    const dataValues = aasConnection.generateDataValues(
      AssetAdministrationShell.create({ content: semitrailerTruckAas }),
      productDataModel,
    );
    expect(dataValues).toEqual(
      ignoreIds([
        DataValue.create({
          dataSectionId: sectionId1,
          dataFieldId: dataFieldId2,
          value: 'GHG',
          row: 0,
        }),
        DataValue.create({
          dataSectionId: sectionId2,
          dataFieldId: dataFieldId3,
          value: 2.63,
          row: 0,
        }),
      ]),
    );
  });
});
