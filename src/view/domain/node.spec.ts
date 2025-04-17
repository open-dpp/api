import {
  Breakpoints,
  DataFieldRef,
  GridContainer,
  GridItem,
  NodeType,
  SectionGrid,
  Size,
} from './node';
import { randomUUID } from 'crypto';
import { ValueError } from '../../exceptions/domain.errors';
import { ignoreIds } from '../../../test/utils';

describe('GridContainer', () => {
  it('should be created', () => {
    const gridContainer = GridContainer.create();
    const gridItem1 = GridItem.create({
      sizes: [Size.create({ breakpoint: Breakpoints.md, colSpan: 4 })],
    });
    const gridItem2 = GridItem.create({
      sizes: [Size.create({ breakpoint: Breakpoints.md, colSpan: 4 })],
    });
    const gridItem3 = GridItem.create({
      sizes: [Size.create({ breakpoint: Breakpoints.md, colSpan: 4 })],
    });

    const subGridContainer = GridContainer.create();
    const subGridItem = GridItem.create({
      sizes: [Size.create({ breakpoint: Breakpoints.sm, colSpan: 12 })],
    });
    subGridContainer.addGridItem(subGridItem);
    gridItem3.replaceContent(subGridContainer);

    gridContainer.addGridItem(gridItem1);
    gridContainer.addGridItem(gridItem2);
    gridContainer.addGridItem(gridItem3);
    expect(gridContainer.children).toEqual([gridItem1, gridItem2, gridItem3]);

    expect(gridContainer.getChildNodes()).toEqual([
      gridItem1,
      gridItem2,
      gridItem3,
    ]);
    expect(gridItem1.getChildNodes()).toEqual([]);
    expect(gridItem2.getChildNodes()).toEqual([]);
    expect(gridItem3.getChildNodes()).toEqual([subGridContainer]);
    expect(subGridContainer.getChildNodes()).toEqual([subGridItem]);
    expect(gridContainer.toPlain()).toEqual({
      id: expect.any(String),
      type: NodeType.GRID_CONTAINER,
      cols: 1,
      children: [
        {
          id: expect.any(String),
          type: NodeType.GRID_ITEM,
          sizes: [{ breakpoint: Breakpoints.md, colSpan: 4 }],
        },
        {
          id: expect.any(String),
          type: NodeType.GRID_ITEM,
          sizes: [{ breakpoint: Breakpoints.md, colSpan: 4 }],
        },
        {
          id: expect.any(String),
          type: NodeType.GRID_ITEM,
          sizes: [{ breakpoint: Breakpoints.md, colSpan: 4 }],
          content: {
            id: expect.any(String),
            type: NodeType.GRID_CONTAINER,
            cols: 1,
            children: [
              {
                id: expect.any(String),
                type: NodeType.GRID_ITEM,
                sizes: [
                  {
                    breakpoint: Breakpoints.sm,
                    colSpan: 12,
                  },
                ],
              },
            ],
          },
        },
      ],
    });
    expect(GridContainer.fromPlain(gridContainer.toPlain()).toPlain()).toEqual(
      gridContainer.toPlain(),
    );
  });

  it.each([
    { cols: 1, colSpan: 12 },
    { cols: 2, colSpan: 6 },
    { cols: 3, colSpan: 4 },
    { cols: 6, colSpan: 2 },
    { cols: 12, colSpan: 1 },
  ])('should be created with cols', ({ cols, colSpan }) => {
    const gridContainer = GridContainer.create({ cols });

    const expectedGridContainer = GridContainer.create();

    const gridItem = GridItem.create({
      sizes: [Size.create({ breakpoint: Breakpoints.sm, colSpan })],
    });
    for (let i = 0; i < cols; i++) {
      expectedGridContainer.addGridItem(gridItem.copy());
    }
    expect(gridContainer.toPlain()).toEqual(
      ignoreIds({ ...expectedGridContainer.toPlain(), cols }),
    );
  });

  it.each([5, 7, 8, 9, 10, 11])(
    'should throw error for not supported cols',
    (cols) => {
      expect(() => GridContainer.create({ cols })).toThrow(
        new ValueError(`${cols} Cols not supported`),
      );
    },
  );
});

describe('SectionGrid', () => {
  it.each([
    { cols: 1, colSpan: 12 },
    { cols: 2, colSpan: 6 },
    { cols: 3, colSpan: 4 },
    { cols: 6, colSpan: 2 },
    { cols: 12, colSpan: 1 },
  ])('should be created with cols', ({ cols, colSpan }) => {
    const sectionId = randomUUID();
    const sectionGrid = SectionGrid.create({ sectionId, cols });

    const expectedGridContainer = GridContainer.create();

    const gridItem = GridItem.create({
      sizes: [Size.create({ breakpoint: Breakpoints.sm, colSpan })],
    });
    for (let i = 0; i < cols; i++) {
      expectedGridContainer.addGridItem(gridItem.copy());
    }
    expect(sectionGrid.toPlain()).toEqual(
      ignoreIds({
        ...expectedGridContainer.toPlain(),
        type: NodeType.SECTION_GRID,
        cols,
        sectionId,
      }),
    );
  });
});

describe('GridItem', () => {
  it('is created with field reference as content', () => {
    const fieldId = randomUUID();
    const content = DataFieldRef.create({ fieldId });
    const sizes = [Size.create({ breakpoint: Breakpoints.md, colSpan: 4 })];
    const gridItem = GridItem.create({
      sizes,
      content,
    });
    expect(gridItem.toPlain()).toEqual({
      id: expect.any(String),
      type: NodeType.GRID_ITEM,
      sizes,
      content: {
        id: expect.any(String),
        type: NodeType.DATA_FIELD_REF,
        fieldId,
      },
    });
  });
});
