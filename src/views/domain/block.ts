import { randomUUID } from 'crypto';

export enum BlockType {
  GROUP_BLOCK = 'GroupBlock',
  REPEATABLE_BLOCK = 'RepeatableBlock',
  TRACEABILITY_BLOCK = 'TraceabilityBlock',
}

export abstract class Block {
  protected constructor(
    private readonly id: string,
    public readonly type: BlockType,
  ) {}
}

export class GroupBlock extends Block {
  private constructor(
    id: string,
    public readonly sectionId: string,
  ) {
    super(id, BlockType.GROUP_BLOCK);
  }

  static create(data: { sectionId: string }) {
    return new GroupBlock(randomUUID(), data.sectionId);
  }
}

export class RepeaterBlock extends Block {
  private constructor(
    id: string,
    public readonly sectionId: string,
  ) {
    super(id, BlockType.REPEATABLE_BLOCK);
  }

  static create(data: { sectionId: string }) {
    return new RepeaterBlock(randomUUID(), data.sectionId);
  }
}
