import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { randomUUID } from 'crypto';
import { Node, nodeSubtypes } from './node';

export class Layout {
  @Expose()
  readonly id: string = randomUUID();
  @Expose()
  readonly name: string;

  @Expose({ name: 'nodes' })
  @Type(() => Node, {
    discriminator: {
      property: 'type',
      subTypes: nodeSubtypes,
    },
    keepDiscriminatorProperty: true,
  })
  private _nodes: Node[] = [];

  get nodes() {
    return this._nodes;
  }

  static create(plain: { name: string }) {
    return Layout.fromPlain(plain);
  }

  static fromPlain(plain: unknown) {
    return plainToInstance(Layout, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  addNode(node: Node) {
    this._nodes.push(node);
  }
  toPlain() {
    return instanceToPlain(this);
  }
}
