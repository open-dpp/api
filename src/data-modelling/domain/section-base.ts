import { Expose, instanceToPlain, Type } from 'class-transformer';
import { randomUUID } from 'crypto';
import { Layout } from './layout';
import { GranularityLevel } from './granularity-level';

export enum SectionType {
  GROUP = 'Group',
  REPEATABLE = 'Repeatable',
}

export abstract class DataSectionBase {
  @Expose()
  readonly id: string = randomUUID();
  @Expose({ name: 'name' })
  protected _name: string;
  @Expose()
  readonly type: SectionType;

  @Expose()
  @Type(() => Layout)
  readonly layout: Layout;

  @Expose({ name: 'subSections' })
  protected _subSections: string[] = [];
  @Expose({ name: 'parentId' })
  protected _parentId?: string;

  @Expose()
  granularityLevel?: GranularityLevel;

  get name() {
    return this._name;
  }

  get subSections() {
    return this._subSections;
  }

  get parentId() {
    return this._parentId;
  }
  toPlain() {
    return instanceToPlain(this);
  }
}
