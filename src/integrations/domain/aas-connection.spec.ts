import { AasFieldAssignment, AasConnection } from './aas-connection';
import { ignoreIds } from '../../../test/utils';
import { DataValue } from '../../product-passport/domain/data-value';
import {
  AssetAdministrationShell,
  AssetAdministrationShellType,
} from './asset-administration-shell';
import { semitrailerAas } from './semitrailer-aas';

describe('AasMapping', () => {
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
    const aasConnection = AasConnection.create({
      dataModelId,
      modelId,
      aasType: AssetAdministrationShellType.Semitrailer_Truck,
    });
    expect(aasConnection.id).toEqual(expect.any(String));
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

  it('should generate data values for semi trailer', () => {
    const dataModelId = 'dataModelId';
    const modelId = 'modelId';
    const aasMapping = AasConnection.create({
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
