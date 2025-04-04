import { Expose, plainToInstance, Type } from 'class-transformer';
import { Block, BlockType } from './block';
import { FieldReference, PageLink } from './links';

export class Grid extends Block {
  type = BlockType.GRID;
  @Expose()
  readonly cols: number;

  @Expose({ name: 'items' })
  @Type(() => Block, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: Grid, name: BlockType.GRID },
        { value: PageLink, name: BlockType.PAGE_LINK },
        { value: FieldReference, name: BlockType.FIELD_REFERENCE },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  _items: Block[] = [];

  get items() {
    return this._items;
  }

  static create(data: { cols: number }) {
    return Grid.fromPlain({ ...data });
  }

  static fromPlain(plain: unknown): Grid {
    return plainToInstance(Grid, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  addItem(item: Block) {
    this._items.push(item);
  }
}
