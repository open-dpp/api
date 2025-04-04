import { randomUUID } from 'crypto';
import { Expose } from 'class-transformer';

export enum BlockType {
  GRID = 'Grid',
  PAGE_LINK = 'PageLink',
  FIELD_REFERENCE = 'FieldReference',
}

export class Block {
  @Expose()
  readonly _id: string = randomUUID();

  @Expose()
  readonly type: BlockType;
}
