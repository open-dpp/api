import { randomUUID } from 'crypto';

export enum DataType {
  TEXT_FIELD = 'TextField',
}

export interface DataField {
  id: string;
  type: DataType;
  name: string;
  value: unknown;
}

export class TextField implements DataField {
  public readonly type = DataType.TEXT_FIELD;
  constructor(
    public readonly id: string = randomUUID(),
    public readonly name: string,
    public readonly value: string,
  ) {}
}

export class DataSection {
  constructor(
    public readonly id: string = randomUUID(),
    public readonly dataFields: DataField[],
  ) {}
}

export class ProductDataModel {
  constructor(
    public readonly id: string = randomUUID(),
    public readonly version: string,
    public readonly sections: DataSection[] = [],
  ) {}
}
