import { randomUUID } from 'crypto';
import { DataValue } from './passport';

describe('DataValue', () => {
  it('should be created', () => {
    const dataValue = DataValue.create({
      value: undefined,
      dataSectionId: randomUUID(),
      dataFieldId: randomUUID(),
    });
    expect(dataValue.id).toBeDefined();
    expect(dataValue.value).toBeUndefined();
  });
});
