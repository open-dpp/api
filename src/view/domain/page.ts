import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { Block } from './block';
import { randomUUID } from 'crypto';
import { blockSubtypes } from './types';

export class Page {
  @Expose()
  readonly _id: string = randomUUID();
  @Expose()
  readonly version: string;

  @Expose()
  readonly name: string;

  @Expose({ name: 'blocks' })
  @Type(() => Block, {
    discriminator: {
      property: 'type',
      subTypes: blockSubtypes,
    },
    keepDiscriminatorProperty: true,
  })
  private _blocks: Block[] = [];

  get blocks() {
    return this._blocks;
  }

  static create(data: { name: string }) {
    return Page.fromPlain({ ...data, version: '1.0.0' });
  }

  static fromPlain(plain: unknown): Page {
    return plainToInstance(Page, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  addBlock(block: Block) {
    this._blocks.push(block);
  }

  toPlain() {
    return instanceToPlain(this);
  }
}
