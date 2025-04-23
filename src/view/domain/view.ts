import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { randomUUID } from 'crypto';
import {
  isGridContainerOrSubclass,
  isGridItem,
  Node,
  nodeSubtypes,
} from './node';
import { ValueError } from '../../exceptions/domain.errors';

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

  @Expose()
  readonly dataModelId: string;

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
    dataModelId: string;
  }) {
    return View.fromPlain({
      name: plain.name,
      version: '1.0.0',
      dataModelId: plain.dataModelId,
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

  findNodeWithParent(
    tree: Node[],
    predicate: (node: Node) => boolean,
    parent: Node | undefined = undefined,
  ): { node: Node; parent: Node | undefined } | undefined {
    for (const node of tree) {
      if (predicate(node)) {
        return { node, parent };
      }

      if (node.getChildNodes().length > 0) {
        const found = this.findNodeWithParent(
          node.getChildNodes(),
          predicate,
          node,
        );
        if (found) {
          return found;
        }
      }
    }

    return undefined;
  }

  findNodeWithParentById(id: string) {
    return this.findNodeWithParent(this._nodes, (node) => node.id === id);
  }

  deleteNodeById(id: string) {
    const result = this.findNodeWithParentById(id);

    if (!result) return false;

    const { parent } = result;

    if (parent) {
      return parent.deleteChildNode(id);
    } else {
      this._nodes = this._nodes.filter((node) => node.id !== id);
      return true;
    }
  }

  addNode(node: Node, parentId?: string) {
    if (parentId) {
      const found = this.findNodeWithParentById(parentId);
      if (found?.node) {
        if (isGridContainerOrSubclass(found.node) && isGridItem(node)) {
          found.node.addGridItem(node);
        } else if (isGridItem(found.node)) {
          found.node.replaceContent(node);
        } else {
          throw new ValueError(
            `${node.type} could not be added to ${found.node.type}`,
          );
        }
      } else {
        throw new ValueError(
          `Parent ${parentId} to add node to could not be found`,
        );
      }
    } else if (isGridContainerOrSubclass(node)) {
      this._nodes.push(node);
    } else {
      throw new ValueError(`Cannot add ${node.type} at root level`);
    }
  }
  toPlain() {
    return instanceToPlain(this);
  }
}
