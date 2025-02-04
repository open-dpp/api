import { randomUUID } from 'crypto';
import { MinLength } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import 'reflect-metadata';
export enum DataType {
  TEXT_FIELD = 'TextField',
}

export abstract class DataField {
  @Expose()
  id!: string;

  @Expose()
  type!: DataType;

  @Expose()
  name!: string;

  @Expose()
  value!: unknown;
  protected constructor(
    id: string,
    name: string,
    type: DataType,
    value: unknown,
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.value = value;
  }
}

export class TextField extends DataField {
  @MinLength(1)
  public readonly value: string;
  constructor(id: string = randomUUID(), name: string, value: string) {
    super(id, name, DataType.TEXT_FIELD, value);
  }
}

export class DataSection {
  @Expose()
  @Type(() => DataField, {
    discriminator: {
      property: 'type',
      subTypes: [{ value: TextField, name: DataType.TEXT_FIELD }],
    },
  })
  public readonly dataFields: DataField[];
  constructor(
    public readonly id: string = randomUUID(),
    dataFields: DataField[],
  ) {
    this.dataFields = dataFields;
  }
}

export class ProductDataModel {
  constructor(
    public readonly id: string = randomUUID(),
    public readonly version: string,
    public readonly sections: DataSection[] = [],
  ) {}
}
