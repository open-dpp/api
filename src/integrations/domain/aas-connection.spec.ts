import { AasFieldAssignment, AasConnection } from './aas-connection';
import { ignoreIds } from '../../../test/utils';
import { DataValue } from '../../product-passport/domain/data-value';
import {
  AssetAdministrationShell,
  AssetAdministrationShellType,
} from './asset-administration-shell';
import { semitrailerAas } from './semitrailer-aas';
import { Model } from '../../models/domain/model';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { User } from '../../users/domain/user';
import { Organization } from '../../organizations/domain/organization';
import { randomUUID } from 'crypto';

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
    const aasMapping = AasConnection.create({
      name: 'Connection Name',
      organizationId,
      userId,
      dataModelId,
      modelId,
      aasType: AssetAdministrationShellType.Semitrailer_Truck,
    });
    const fieldMapping = AasFieldAssignment.create({
      dataFieldId: 'internalField',
      sectionId: 'internalSectionId',
      idShortParent: 'ProductCarbonFootprint_A1A3',
      idShort: 'PCFCO2eq',
    });
    aasMapping.addFieldAssignment(fieldMapping);

    const dataValues = aasMapping.generateDataValues(
      AssetAdministrationShell.create({ content: semitrailerAas }),
    );
    expect(dataValues).toEqual(
      ignoreIds([
        DataValue.create({
          dataSectionId: 'internalSectionId',
          dataFieldId: 'internalField',
          value: '2.6300',
          row: 0,
        }),
      ]),
    );
  });
});
