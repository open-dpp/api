import { Block, GroupBlock, RepeaterBlock } from './block';
import { randomUUID } from 'crypto';
import {
  DataSectionBase,
  SectionType,
} from '../../data-modelling/domain/section-base';

export class Page {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly blocks: Block[],
  ) {}

  static create(data: {
    id?: string;
    title: string;
    sections: DataSectionBase[];
  }) {
    const blocks: Block[] = [];
    for (const section of data.sections) {
      const sharedProps = { sectionId: section.id };
      if (section.type === SectionType.GROUP) {
        blocks.push(GroupBlock.create(sharedProps));
      } else {
        blocks.push(RepeaterBlock.create(sharedProps));
      }
    }
    return new Page(data.id ?? randomUUID(), data.title, blocks);
  }

  addBlock(block: Block) {
    this.blocks.push(block);
  }
}
