import { randomUUID } from 'crypto';
import { DataValue } from './passport';

describe('DataValue', () => {
  it('should be created', () => {
    const dataSectionId = randomUUID();
    const dataFieldId = randomUUID();
    const dataValue = DataValue.create({
      value: undefined,
      dataSectionId,
      dataFieldId,
    });
    expect(dataValue.value).toBeUndefined();
    expect(dataValue.dataSectionId).toEqual(dataSectionId);
    expect(dataValue.dataFieldId).toEqual(dataFieldId);
  });
});
