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

export class Breakpoint {
  @Expose()
  public name: string;
  @Expose()
  public sizeInPx: number;
  static create(plain: { sizeInPx: number; name: string }) {
    return plainToInstance(Breakpoint, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
}

export class Breakpoints {
  static xs() {
    return Breakpoint.create({ sizeInPx: 0, name: 'xs' });
  }
  static sm() {
    return Breakpoint.create({ sizeInPx: 600, name: 'sm' });
  }
  static md() {
    return Breakpoint.create({ sizeInPx: 900, name: 'md' });
  }
  static lg() {
    return Breakpoint.create({ sizeInPx: 1200, name: 'lg' });
  }
  static xl() {
    return Breakpoint.create({ sizeInPx: 1536, name: 'xl' });
  }
}

export class Size {
  @Expose()
  public breakpoint: Breakpoint;
  @Expose()
  public colSpan: number;
  static create(plain: { breakpoint: Breakpoint; colSpan: number }) {
    if (!z.number().int().min(1).max(12).safeParse(plain.colSpan).success) {
      throw new ValueError('Col span has to be an integer between 1 or 12');
    }
    return plainToInstance(Size, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
}

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
  protected type: NodeType;
}

export class GridContainer extends Node {
  type = NodeType.GRID_CONTAINER;
  static readonly MAX_COLS = 12;

  @Expose({ name: 'children' })
  @Type(() => GridItem)
  private _children: GridItem[] = [];

  get children() {
    return this._children;
  }

  static create(plain?: { cols: number }) {
    const children =
      plain?.cols !== undefined
        ? GridContainer.createChildrenFromCols(plain.cols)
        : [];

    return plainToInstance(
      GridContainer,
      { children },
      {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      },
    );
  }

  private static createChildrenFromCols(cols: number) {
    const validCols = z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(6),
      z.literal(12),
    ]);
    if (!validCols.safeParse(cols).success) {
      throw new ValueError(`${cols} Cols not supported`);
    }
    const sizeOfCols = this.MAX_COLS / cols;
    return new Array(cols).fill(undefined).map(() =>
      GridItem.create({
        sizes: [
          Size.create({ breakpoint: Breakpoints.sm(), colSpan: sizeOfCols }),
        ],
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

  static create(plain: { sectionId: string; cols: number }) {
    const gridContainer = GridContainer.create({ cols: plain.cols }).toPlain();
    return plainToInstance(
      SectionGrid,
      { ...omit(gridContainer, 'type'), ...omit(plain, 'cols') },
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
  public sizes: Size[] = [];

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

  static create(plain: { sizes: Size[]; content?: Node }) {
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
