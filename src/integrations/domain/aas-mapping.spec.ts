import { AasFieldMapping, AasMapping } from './aas-mapping';
import { ignoreIds } from '../../../test/utils';
import { aasTruckExample } from './truck-example';
import { DataValue } from '../../product-passport/domain/data-value';

describe('AasMapping', () => {
  it('should create field mapping', () => {
    const fieldMapping = AasFieldMapping.create({
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
    const aasMapping = AasMapping.create({ dataModelId });
    expect(aasMapping.id).toEqual(expect.any(String));
    expect(aasMapping.dataModelId).toEqual(dataModelId);
    expect(aasMapping.fieldMappings).toEqual([]);
    const fieldMapping = AasFieldMapping.create({
      dataFieldId: 'internalField',
      sectionId: 'internalSectionId',
      idShortParent: 'externalFieldParent',
      idShort: 'externalField',
    });
    aasMapping.addFieldMapping(fieldMapping);
    expect(aasMapping.fieldMappings).toEqual([fieldMapping]);
  });

  it('should generate data values for truck example', () => {
    const dataModelId = 'dataModelId';
    const aasMapping = AasMapping.create({ dataModelId });
    const fieldMapping = AasFieldMapping.create({
      dataFieldId: 'internalField',
      sectionId: 'internalSectionId',
      idShortParent: 'ProductCarbonFootprint_A1A3',
      idShort: 'PCFCO2eq',
    });
    aasMapping.addFieldMapping(fieldMapping);

    const dataValues = aasMapping.generateDataValues(aasTruckExample);
    expect(dataValues).toEqual(
      ignoreIds([
        DataValue.create({
          dataSectionId: 'internalSectionId',
          dataFieldId: 'internalField',
          value: 2.63,
          row: 0,
        }),
      ]),
    );
  });
});
