import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { ValueError } from '../../exceptions/domain.errors';
import { omit } from 'lodash';
import { randomUUID } from 'crypto';
import { z } from 'zod';

export enum NodeType {
  SECTION_GRID = 'SectionGrid',
  DATA_FIELD_REF = 'DataFieldRef',
}

const ResponsiveConfigSchema = z.object({
  xs: z.number().int().min(1).max(12).optional(),
  sm: z.number().int().min(1).max(12).optional(),
  md: z.number().int().min(1).max(12).optional(),
  lg: z.number().int().min(1).max(12).optional(),
  xl: z.number().int().min(1).max(12).optional(),
});

function validateConfigFail(config: ResponsiveConfig, errorPrefix: string) {
  if (!ResponsiveConfigSchema.safeParse(config).success) {
    throw new ValueError(`${errorPrefix} has to be an integer between 1 or 12`);
  }
}

function validateColAndRowConfig(config: {
  colStart?: ResponsiveConfig;
  colSpan?: ResponsiveConfig;
  rowSpan?: ResponsiveConfig;
  rowStart?: ResponsiveConfig;
}) {
  if (config.colStart) {
    validateConfigFail(config.colStart, 'colStart');
  }
  if (config.colSpan) {
    validateConfigFail(config.colSpan, 'colSpan');
  }
  if (config.rowStart) {
    validateConfigFail(config.rowStart, 'rowStart');
  }
  if (config.rowSpan) {
    validateConfigFail(config.rowSpan, 'rowSpan');
  }
}

export type ResponsiveConfig = z.infer<typeof ResponsiveConfigSchema>;

export abstract class Node {
  @Expose()
  readonly id: string = randomUUID();
  @Expose()
  public type: NodeType;
  @Expose()
  public colStart: ResponsiveConfig;
  @Expose()
  public colSpan: ResponsiveConfig;
  @Expose()
  public rowStart?: ResponsiveConfig;
  @Expose()
  public rowSpan?: ResponsiveConfig;
  @Expose({ name: 'parentId' })
  protected _parentId?: string;
  @Expose({ name: 'children' })
  protected _children: string[] = [];

  get children() {
    return this._children;
  }

  get parentId() {
    return this._parentId;
  }

  assignParent(parentId: string) {
    this._parentId = parentId;
  }

  removeParent() {
    this._parentId = undefined;
  }

  modifyConfigs(plain: Partial<NodeProps>) {
    validateColAndRowConfig(plain);
    this.colSpan = plain.colSpan ?? this.colSpan;
    this.colStart = plain.colStart ?? this.colStart;
    this.rowStart = plain.rowStart ?? this.rowStart;
    this.rowSpan = plain.rowSpan ?? this.rowSpan;
  }
}

type NodeProps = {
  colStart: ResponsiveConfig;
  colSpan: ResponsiveConfig;
  rowSpan?: ResponsiveConfig;
  rowStart?: ResponsiveConfig;
};

export class SectionGrid extends Node {
  type = NodeType.SECTION_GRID;
  @Expose()
  cols: ResponsiveConfig;
  @Expose()
  readonly sectionId: string;

  static create(
    plain: NodeProps & { cols: ResponsiveConfig; sectionId: string },
  ) {
    validateColAndRowConfig(omit(plain, 'sectionId'));
    return SectionGrid.fromPlain(plain);
  }

  modifyCols(cols: ResponsiveConfig) {
    validateConfigFail(cols, 'grid-cols');
    this.cols = cols;
  }

  static fromPlain(plain: unknown) {
    return plainToInstance(SectionGrid, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  addNode(node: Node) {
    if (this.children.find((id) => id === node.id)) {
      throw new ValueError(`Node with ${node.id} is already child.`);
    }
    this._children.push(node.id);
    node.assignParent(this.id);
  }

  deleteNode(node: Node) {
    if (!this.children.find((id) => id === node.id)) {
      throw new ValueError(
        `Could not found and delete node ${node.id} from ${this.id}`,
      );
    }
    this._children = this.children.filter((n) => n !== node.id);
    node.removeParent();
    return node;
  }

  toPlain() {
    return instanceToPlain(this);
  }
}

export class DataFieldRef extends Node {
  type = NodeType.DATA_FIELD_REF;
  @Expose()
  readonly fieldId: string;

  static create(plain: NodeProps & { fieldId: string }) {
    validateColAndRowConfig(omit(plain, 'fieldId'));
    return DataFieldRef.fromPlain(plain);
  }

  static fromPlain(plain: unknown) {
    return plainToInstance(DataFieldRef, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  toPlain() {
    return instanceToPlain(this);
  }
}

export const nodeSubtypes = [
  { value: SectionGrid, name: NodeType.SECTION_GRID },
  { value: DataFieldRef, name: NodeType.DATA_FIELD_REF },
];

export function isSectionGrid(node: Node): node is SectionGrid {
  return node.type === NodeType.SECTION_GRID;
}

export function isDataFieldRef(node: Node): node is DataFieldRef {
  return node.type === NodeType.DATA_FIELD_REF;
}
