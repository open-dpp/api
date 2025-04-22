import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { z } from 'zod';
import { ValueError } from '../../exceptions/domain.errors';
import { omit } from 'lodash';
import { randomUUID } from 'crypto';

const ResponsiveConfigSchema = z.object({
  xs: z.number().int().min(1).max(12).optional(),
  sm: z.number().int().min(1).max(12).optional(),
  md: z.number().int().min(1).max(12).optional(),
  lg: z.number().int().min(1).max(12).optional(),
  xl: z.number().int().min(1).max(12).optional(),
});

export type ResponsiveConfig = z.infer<typeof ResponsiveConfigSchema>;

export enum NodeType {
  GRID_CONTAINER = 'GridContainer',
  GRID_ITEM = 'GridItem',
  SECTION_GRID = 'SectionGrid',
  DATA_FIELD_REF = 'DataFieldRef',
}

export abstract class Node {
  @Expose()
  readonly id: string = randomUUID();
  @Expose()
  public type: NodeType;
  abstract getChildNodes(): Node[];
  abstract deleteChildNode(id: string): boolean;
}

export class GridContainer extends Node {
  type = NodeType.GRID_CONTAINER;

  @Expose()
  cols: ResponsiveConfig;

  @Expose({ name: 'children' })
  @Type(() => GridItem)
  private _children: GridItem[] = [];

  get children() {
    return this._children;
  }

  getChildNodes(): Node[] {
    return this._children;
  }

  deleteChildNode(id: string): boolean {
    this._children = this._children.filter((child) => child.id !== id);
    return true;
  }

  static create(plain?: {
    cols?: ResponsiveConfig;
    initNumberOfChildren?: number;
  }) {
    const cols = plain?.cols ?? { sm: 1 };
    const validation = ResponsiveConfigSchema.safeParse(cols);
    if (!validation.success) {
      throw new ValueError(`Cols not supported ${validation.error.message}`);
    }
    const children = plain?.initNumberOfChildren
      ? this.createChildren(plain.initNumberOfChildren)
      : [];
    return GridContainer.fromPlain({ cols, children });
  }

  static fromPlain(plain: unknown) {
    return plainToInstance(GridContainer, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  private static createChildren(numberOfChildren: number) {
    return new Array(numberOfChildren).fill(undefined).map(() =>
      GridItem.create({
        colSpan: { sm: 1 },
      }),
    );
  }

  addGridItem(gridItem: GridItem) {
    this._children.push(gridItem);
  }

  toPlain() {
    return instanceToPlain(this);
  }
}

export class SectionGrid extends GridContainer {
  type = NodeType.SECTION_GRID;
  @Expose()
  readonly sectionId: string;

  static create(plain: {
    sectionId: string;
    cols?: ResponsiveConfig;
    initNumberOfChildren?: number;
  }) {
    const gridContainer = GridContainer.create({
      cols: plain.cols,
      initNumberOfChildren: plain.initNumberOfChildren,
    }).toPlain();
    return plainToInstance(
      SectionGrid,
      {
        ...omit(gridContainer, 'type'),
        ...omit(plain, 'cols'),
        ...omit(plain, 'initNumberOfChildren'),
      },
      {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      },
    );
  }
}

export class DataFieldRef extends Node {
  type = NodeType.DATA_FIELD_REF;
  @Expose()
  readonly fieldId: string;

  getChildNodes(): Node[] {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deleteChildNode(id: string): boolean {
    return false;
  }

  static create(plain: { fieldId: string }) {
    return plainToInstance(DataFieldRef, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
}

export const nodeSubtypesWithoutGridItem = [
  { value: GridContainer, name: NodeType.GRID_CONTAINER },
  { value: SectionGrid, name: NodeType.SECTION_GRID },
  { value: DataFieldRef, name: NodeType.DATA_FIELD_REF },
];

export class GridItem extends Node {
  type = NodeType.GRID_ITEM;
  @Expose()
  public colSpan: ResponsiveConfig;

  @Expose()
  public colStart?: ResponsiveConfig;

  @Expose({ name: 'content' })
  @Type(() => Node, {
    discriminator: {
      property: 'type',
      subTypes: nodeSubtypesWithoutGridItem,
    },
    keepDiscriminatorProperty: true,
  })
  private _content?: Node;

  get content() {
    return this._content;
  }

  getChildNodes(): Node[] {
    return this._content ? [this._content] : [];
  }

  deleteChildNode(id: string): boolean {
    if (this._content?.id === id) {
      this._content = undefined;
      return true;
    }
    return false;
  }

  static create(plain: {
    colSpan: ResponsiveConfig;
    colStart?: ResponsiveConfig;
    content?: Node;
  }) {
    if (!ResponsiveConfigSchema.safeParse(plain.colSpan).success) {
      throw new ValueError('Col span has to be an integer between 1 or 12');
    }
    if (
      plain.colStart &&
      !ResponsiveConfigSchema.safeParse(plain.colStart).success
    ) {
      throw new ValueError('Col start has to be an integer between 1 or 12');
    }
    return GridItem.fromPlain(plain);
  }

  static fromPlain(plain: unknown) {
    return plainToInstance(GridItem, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  replaceContent(content: Node) {
    this._content = content;
  }

  copy() {
    return GridItem.fromPlain(this.toPlain());
  }

  toPlain() {
    return instanceToPlain(this);
  }
}

export const nodeSubtypes = [
  ...nodeSubtypesWithoutGridItem,
  { value: GridItem, name: NodeType.GRID_ITEM },
];

export function isGridContainer(node: Node): node is GridContainer {
  return node.type === NodeType.GRID_CONTAINER;
}

export function isGridItem(node: Node): node is GridItem {
  return node.type === NodeType.GRID_ITEM;
}
