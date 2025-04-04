import { Page } from './page';
import { randomUUID } from 'crypto';
import { Grid } from './grid';
import { FieldReference, PageLink } from './links';

import { BlockType } from './block';

describe('Page', () => {
  it('is created', () => {
    const page = Page.create({ name: 'Tech Specs' });
    expect(page.version).toEqual('1.0.0');
    expect(page.blocks).toEqual([]);
    const dataFieldId1 = randomUUID();
    const dataFieldId2 = randomUUID();
    const grid = Grid.create({ cols: 2 });
    grid.addItem(FieldReference.create({ fieldId: dataFieldId1 }));
    grid.addItem(FieldReference.create({ fieldId: dataFieldId2 }));
    page.addBlock(grid);
    const pageToLink = Page.create({ name: 'Dimensions' });
    page.addBlock(PageLink.create({ page: pageToLink }));
    expect(page.toPlain().blocks).toEqual([
      {
        id: expect.any(String),
        type: BlockType.GRID,
        cols: 2,
        items: [
          {
            id: expect.any(String),
            type: BlockType.FIELD_REFERENCE,
            fieldId: dataFieldId1,
          },
          {
            id: expect.any(String),
            type: BlockType.FIELD_REFERENCE,
            fieldId: dataFieldId2,
          },
        ],
      },
      {
        id: expect.any(String),
        type: BlockType.PAGE_LINK,
        pageId: pageToLink.id,
      },
    ]);
  });

  it('is created from plain', () => {
    const page = Page.fromPlain({
      name: 'Tech Specs',
      version: '1.0.0',
      blocks: [
        {
          type: BlockType.GRID,
          cols: 2,
          items: [
            {
              type: BlockType.FIELD_REFERENCE,
              fieldId: 'f1',
            },
            {
              type: BlockType.FIELD_REFERENCE,
              fieldId: 'f2',
            },
          ],
        },
        {
          type: BlockType.PAGE_LINK,
          pageId: 'p1',
        },
      ],
    });

    expect(page.blocks[0]).toBeInstanceOf(Grid);
    expect((page.blocks[0] as Grid).items[0]).toBeInstanceOf(FieldReference);

    expect(page.toPlain().blocks).toEqual([
      {
        id: expect.any(String),
        type: BlockType.GRID,
        cols: 2,
        items: [
          {
            id: expect.any(String),
            type: BlockType.FIELD_REFERENCE,
            fieldId: 'f1',
          },
          {
            id: expect.any(String),
            type: BlockType.FIELD_REFERENCE,
            fieldId: 'f2',
          },
        ],
      },
      {
        id: expect.any(String),
        type: BlockType.PAGE_LINK,
        pageId: 'p1',
      },
    ]);
  });
});
