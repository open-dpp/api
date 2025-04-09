import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { randomUUID } from 'crypto';
import { Node, nodeSubtypes } from './node';
import { NotFoundError } from '../../exceptions/domain.errors';

export class View {
  @Expose()
  readonly id: string = randomUUID();
  @Expose()
  readonly name: string;

  @Expose()
  readonly version: string;

  @Expose({ name: 'nodes' })
  @Type(() => Node, {
    discriminator: {
      property: 'type',
      subTypes: nodeSubtypes,
    },
    keepDiscriminatorProperty: true,
  })
  private _nodes: Node[] = [];

  @Expose({ name: 'ownedByOrganizationId' })
  private _ownedByOrganizationId: string | undefined;

  @Expose({ name: 'createdByUserId' })
  private _createdByUserId: string | undefined;

  get nodes() {
    return this._nodes;
  }

  get ownedByOrganizationId() {
    return this._ownedByOrganizationId;
  }

  get createdByUserId() {
    return this._createdByUserId;
  }

  static create(plain: {
    name: string;
    userId: string;
    organizationId: string;
  }) {
    return View.fromPlain({
      name: plain.name,
      version: '1.0.0',
      createdByUserId: plain.userId,
      ownedByOrganizationId: plain.organizationId,
    });
  }

  static fromPlain(plain: unknown) {
    return plainToInstance(View, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  public isOwnedBy(organizationId: string) {
    return this._ownedByOrganizationId === organizationId;
  }

  findNodeOrFail(nodeId: string) {
    const node = this._nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new NotFoundError(Node.name, nodeId);
    }
    return node;
  }

  addNode(node: Node) {
    this._nodes.push(node);
  }
  toPlain() {
    return instanceToPlain(this);
  }
}
