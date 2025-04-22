import {
  DataFieldRef,
  GridContainer,
  GridItem,
  NodeType,
  SectionGrid,
} from './node';
import { randomUUID } from 'crypto';
import { ValueError } from '../../exceptions/domain.errors';
import { ignoreIds } from '../../../test/utils';

describe('GridContainer', () => {
  it('should be created', () => {
    const gridContainer = GridContainer.create();
    const gridItem1 = GridItem.create({
      colSpan: { md: 4 },
    });
    const gridItem2 = GridItem.create({
      colSpan: { md: 4 },
    });
    const gridItem3 = GridItem.create({
      colSpan: { md: 4 },
    });

    const subGridContainer = GridContainer.create();
    const subGridItem = GridItem.create({
      colSpan: { sm: 12 },
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
      cols: { sm: 1 },
      children: [
        {
          id: expect.any(String),
          type: NodeType.GRID_ITEM,
          colSpan: { md: 4 },
        },
        {
          id: expect.any(String),
          type: NodeType.GRID_ITEM,
          colSpan: { md: 4 },
        },
        {
          id: expect.any(String),
          type: NodeType.GRID_ITEM,
          colSpan: { md: 4 },
          content: {
            id: expect.any(String),
            type: NodeType.GRID_CONTAINER,
            cols: { sm: 1 },
            children: [
              {
                id: expect.any(String),
                type: NodeType.GRID_ITEM,
                colSpan: { sm: 12 },
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
    { cols: 1 },
    { cols: 2 },
    { cols: 3 },
    { cols: 4 },
    { cols: 5 },
    { cols: 6 },
    { cols: 7 },
    { cols: 8 },
    { cols: 9 },
    { cols: 10 },
    { cols: 11 },
    { cols: 12 },
  ])('should be created with cols and initial children', ({ cols }) => {
    const gridContainer = GridContainer.create({
      cols: { sm: cols },
      initNumberOfChildren: cols,
    });

    const expectedGridContainer = GridContainer.create({ cols: { sm: cols } });

    const gridItem = GridItem.create({
      colSpan: { sm: 1 },
    });
    for (let i = 0; i < cols; i++) {
      expectedGridContainer.addGridItem(gridItem.copy());
    }
    expect(gridContainer.toPlain()).toEqual(
      ignoreIds({ ...expectedGridContainer.toPlain() }),
    );
  });

  it.each([2.2, 13, -1])(
    'should throw error for not supported cols',
    (cols) => {
      expect(() => GridContainer.create({ cols: { sm: cols } })).toThrow(
        ValueError,
      );
    },
  );
});

describe('SectionGrid', () => {
  it('should be created with cols', () => {
    const sectionId = randomUUID();
    const sectionGrid = SectionGrid.create({
      sectionId,
      initNumberOfChildren: 3,
    });

    const expectedGridContainer = GridContainer.create();

    const gridItem = GridItem.create({
      colSpan: { sm: 1 },
    });
    for (let i = 0; i < 3; i++) {
      expectedGridContainer.addGridItem(gridItem.copy());
    }
    expect(sectionGrid.toPlain()).toEqual(
      ignoreIds({
        ...expectedGridContainer.toPlain(),
        type: NodeType.SECTION_GRID,
        cols: { sm: 1 },
        sectionId,
      }),
    );
  });
});

describe('GridItem', () => {
  it('is created with field reference as content', () => {
    const fieldId = randomUUID();
    const content = DataFieldRef.create({ fieldId });
    const colSpan = { md: 4 };
    const gridItem = GridItem.create({
      colSpan,
      content,
    });
    expect(gridItem.toPlain()).toEqual({
      id: expect.any(String),
      type: NodeType.GRID_ITEM,
      colSpan,
      content: {
        id: expect.any(String),
        type: NodeType.DATA_FIELD_REF,
        fieldId,
      },
    });
  });

  it('is created with col start', () => {
    const colStart = { sm: 3 };
    const gridItem = GridItem.create({
      colSpan: { sm: 4 },
      colStart,
    });
    expect(gridItem.colStart).toEqual(colStart);
    expect(() =>
      GridItem.create({ colSpan: { sm: 4 }, colStart: { md: 13 } }),
    ).toThrow(new ValueError('Col start has to be an integer between 1 or 12'));
  });
});
