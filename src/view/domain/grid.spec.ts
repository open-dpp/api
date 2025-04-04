import { BlockType } from './block';
import { Grid } from './grid';
import { FieldReference } from './links';

describe('Grid', () => {
  it('is created from plain', () => {
    const grid = Grid.fromPlain({
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
    });
    expect(grid.items[0]).toEqual({
      id: expect.any(String),
      type: BlockType.FIELD_REFERENCE,
      fieldId: 'f1',
    });
    expect(grid.items[0]).toBeInstanceOf(FieldReference);
  });
});
