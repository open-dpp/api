import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { randomUUID } from 'crypto';
import { Node, nodeSubtypes } from './node';
import { NotFoundError } from '../../exceptions/domain.errors';
import { User } from '../../users/domain/user';
import { Organization } from '../../organizations/domain/organization';

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
    user: User;
    organization: Organization;
  }) {
    return View.fromPlain({
      name: plain.name,
      version: '1.0.0',
      createdByUserId: plain.user.id,
      ownedByOrganizationId: plain.organization.id,
    });
  }

  static fromPlain(plain: unknown) {
    return plainToInstance(View, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  public isOwnedBy(organization: Organization) {
    return this._ownedByOrganizationId === organization.id;
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
