import { AasFieldMapping, AasMapping } from './aas-mapping';
import { DataValue } from '../../models/domain/model';
import { ignoreIds } from '../../../test/utils';
import { aasTruckExample } from './truck-example';
import { omit } from 'lodash';

describe('AasMapping', () => {
  it('should create field mapping', () => {
    const fieldMapping = new AasFieldMapping(
      'internalField',
      'internalSectionId',
      'externalFieldParent',
      'externalField',
    );
    expect(fieldMapping.dataFieldId).toEqual('internalField');
    expect(fieldMapping.sectionId).toEqual('internalSectionId');
    expect(fieldMapping.idShort).toEqual('externalField');
    expect(fieldMapping.idShortParent).toEqual('externalFieldParent');
  });

  it('should create aas mapping and add field mappings', () => {
    const dataModelId = 'dataModelId';
    const aasMapping = new AasMapping(dataModelId);
    expect(aasMapping.id).toEqual(expect.any(String));
    expect(aasMapping.dataModelId).toEqual(dataModelId);
    expect(aasMapping.fieldMappings).toEqual([]);
    const fieldMapping = new AasFieldMapping(
      'internalField',
      'internalSectionId',
      'externalFieldParent',
      'externalField',
    );
    aasMapping.addFieldMapping(fieldMapping);
    expect(aasMapping.fieldMappings).toEqual([fieldMapping]);
  });

  it('should generate data values for truck example', () => {
    const dataModelId = 'dataModelId';
    const aasMapping = new AasMapping(dataModelId);
    const fieldMapping = new AasFieldMapping(
      'internalField',
      'internalSectionId',
      'ProductCarbonFootprint_A1A3',
      'PCFCO2eq',
    );
    aasMapping.addFieldMapping(fieldMapping);

    const dataValues = aasMapping.generateDataValues(aasTruckExample);
    expect(dataValues).toEqual(
      ignoreIds([new DataValue('internalSectionId', 'internalField', 2.63)]),
    );
  });
});
