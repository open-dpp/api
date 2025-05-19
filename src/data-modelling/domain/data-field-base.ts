import { Expose, instanceToPlain, Type } from 'class-transformer';
import { randomUUID } from 'crypto';
import { Layout } from './layout';

export enum DataFieldType {
  TEXT_FIELD = 'TextField',
}

export abstract class DataFieldBase {
  @Expose()
  readonly id: string = randomUUID();
  @Expose({ name: 'name' })
  protected _name: string;
  @Expose()
  readonly type: DataFieldType;
  @Expose()
  readonly options: Record<string, unknown> = {};
  @Expose()
  @Type(() => Layout)
  readonly layout: Layout;

  get name() {
    return this._name;
  }
  toPlain() {
    return instanceToPlain(this);
  }
}
