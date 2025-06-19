import { Expose, instanceToPlain, Type } from 'class-transformer';
import { randomUUID } from 'crypto';
import { Layout } from './layout';
import { GranularityLevel } from './granularity-level';

export enum DataFieldType {
  TEXT_FIELD = 'TextField',
  PRODUCT_PASSPORT_LINK = 'ProductPassportLink',
  NUMERIC_FIELD = 'NumericField',
}

export abstract class DataFieldBase {
  @Expose()
  readonly id: string = randomUUID();
  @Expose()
  readonly type: DataFieldType;
  @Expose()
  readonly options: Record<string, unknown> = {};
  @Expose()
  @Type(() => Layout)
  readonly layout: Layout;
  @Expose()
  readonly granularityLevel: GranularityLevel;

  @Expose({ name: 'name' })
  protected _name: string;

  get name() {
    return this._name;
  }

  toPlain() {
    return instanceToPlain(this);
  }
}
