import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { randomUUID } from 'crypto';
import { isDataFieldRef, isSectionGrid, Node, nodeSubtypes } from './node';
import { ValueError } from '../../exceptions/domain.errors';

export enum TargetGroup {
  ALL = 'All',
}

export class View {
  @Expose()
  readonly id: string = randomUUID();
  @Expose()
  readonly targetGroup: TargetGroup;

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

  @Expose()
  readonly dataModelId: string;

  get nodes() {
    return this._nodes;
  }

  static create(plain: { targetGroup: TargetGroup; dataModelId: string }) {
    return View.fromPlain({
      targetGroup: plain.targetGroup,
      version: '1.0.0',
      dataModelId: plain.dataModelId,
    });
  }

  static fromPlain(plain: unknown) {
    return plainToInstance(View, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  findNodeWithParent(predicate: (node: Node) => boolean): {
    node: Node | undefined;
    parent: Node | undefined;
  } {
    const node = this.nodes.find((n) => predicate(n));
    const parent = node?.parentId
      ? this.nodes.find((n) => n.id === node.parentId)
      : undefined;
    return { node, parent };
  }

  findNodeWithParentById(id: string) {
    return this.findNodeWithParent((node) => node.id === id);
  }

  findNodeWithParentBySectionId(sectionId: string) {
    return this.findNodeWithParent(
      (node) => isSectionGrid(node) && node.sectionId === sectionId,
    );
  }

  findNodeWithParentByFieldId(fieldId: string) {
    return this.findNodeWithParent(
      (node) => isDataFieldRef(node) && node.fieldId === fieldId,
    );
  }

  deleteNodeById(id: string) {
    const { node, parent } = this.findNodeWithParentById(id);
    if (!node) {
      throw new ValueError(`Could not found and delete node with id ${id}`);
    }
    if (parent && isSectionGrid(parent)) {
      parent.deleteNode(node);
    }
    for (const childNodeId of node.children) {
      this.deleteNodeById(childNodeId);
    }
    this._nodes = this.nodes.filter((s) => s.id !== node.id);
  }

  addNode(node: Node, parentId?: string) {
    if (parentId) {
      const { node: parentNode } = this.findNodeWithParentById(parentId);
      if (parentNode) {
        if (isSectionGrid(parentNode)) {
          parentNode.addNode(node);
          this._nodes.push(node);
        } else {
          throw new ValueError(
            `${node.type} could not be added to ${parentNode.type}`,
          );
        }
      } else {
        throw new ValueError(
          `Parent ${parentId} to add node to could not be found`,
        );
      }
    } else if (isSectionGrid(node)) {
      this._nodes.push(node);
    } else {
      throw new ValueError(`Cannot add ${node.type} at root level`);
    }
  }
  toPlain(options?: { sortNodesById?: boolean }) {
    const instance = instanceToPlain(this);
    if (options?.sortNodesById) {
      instance.nodes.sort((a, b) => a.id.localeCompare(b.id));
    }
    return instance;
  }

  publish(publishedModelId: string) {
    return View.fromPlain({
      ...this.toPlain(),
      id: randomUUID(),
      dataModelId: publishedModelId,
    });
  }
}
