import {
  Breakpoints,
  DataFieldRef,
  GridContainer,
  GridItem,
  NodeType,
  SectionGrid,
  Size,
} from './node';
import { Layout } from './layout';
import { ignoreIds } from '../../../test/utils';

describe('Layout', () => {
  it('is created and grid containers are added', () => {
    const layout = Layout.create({ name: 'My layout' });
    expect(layout.id).toEqual(expect.any(String));
    expect(layout.name).toEqual('My layout');
    const gridContainer1 = GridContainer.create({ cols: 3 });
    const gridContainer2 = GridContainer.create({ cols: 3 });
    layout.addNode(gridContainer1);
    layout.addNode(gridContainer2);
    expect(layout.nodes).toEqual([gridContainer1, gridContainer2]);
  });

  it('is created from plain', () => {
    const smSize = Breakpoints.sm().sizeInPx;
    const plain = {
      name: 'my layout',
      nodes: [
        {
          type: NodeType.GRID_CONTAINER,
          children: [
            {
              type: NodeType.GRID_ITEM,
              sizes: [{ breakpoint: { sizeInPx: smSize }, colSpan: 4 }],
              content: {
                type: NodeType.DATA_FIELD_REF,
                fieldId: 'f1',
              },
            },
          ],
        },
        {
          type: NodeType.SECTION_GRID,
          sectionId: 'sectionId',
          children: [
            {
              type: NodeType.GRID_ITEM,
              sizes: [{ breakpoint: { sizeInPx: smSize }, colSpan: 12 }],
            },
          ],
        },
      ],
    };
    const layout = Layout.fromPlain(plain);
    const expectedGridContainer = GridContainer.create();
    const expectedGridItem = GridItem.create({
      sizes: [Size.create({ breakpoint: Breakpoints.sm(), colSpan: 4 })],
    });
    expectedGridItem.replaceContent(DataFieldRef.create({ fieldId: 'f1' }));

    expectedGridContainer.addGridItem(expectedGridItem);
    expect(layout.toPlain().nodes).toEqual(
      ignoreIds([
        expectedGridContainer.toPlain(),
        SectionGrid.create({ sectionId: 'sectionId', cols: 1 }).toPlain(),
      ]),
    );
  });
});
