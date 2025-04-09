import {
  Breakpoints,
  DataFieldRef,
  GridContainer,
  GridItem,
  Node,
  NodeType,
  SectionGrid,
  Size,
} from './node';
import { View } from './view';
import { ignoreIds } from '../../../test/utils';
import { NotFoundError } from '../../exceptions/domain.errors';
import { randomUUID } from 'crypto';

describe('View', () => {
  const userId = randomUUID();
  const organizationId = randomUUID();
  it('is created and grid containers are added', () => {
    const view = View.create({ name: 'My layout', userId, organizationId });
    expect(view.id).toEqual(expect.any(String));
    expect(view.name).toEqual('My layout');
    expect(view.version).toEqual('1.0.0');
    const gridContainer1 = GridContainer.create({ cols: 3 });
    const gridContainer2 = GridContainer.create({ cols: 3 });
    view.addNode(gridContainer1);
    view.addNode(gridContainer2);
    expect(view.nodes).toEqual([gridContainer1, gridContainer2]);
  });

  it('is created from plain', () => {
    const smSize = Breakpoints.sm().sizeInPx;
    const smName = 'sm';
    const plain = {
      name: 'my layout',
      version: '1.0.1',
      ownedByOrganizationId: randomUUID(),
      createdByUserId: randomUUID(),
      nodes: [
        {
          type: NodeType.GRID_CONTAINER,
          children: [
            {
              type: NodeType.GRID_ITEM,
              sizes: [
                { breakpoint: { sizeInPx: smSize, name: smName }, colSpan: 4 },
              ],
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
              sizes: [
                { breakpoint: { sizeInPx: smSize, name: smName }, colSpan: 12 },
              ],
            },
          ],
        },
      ],
    };
    const view = View.fromPlain(plain);
    const expectedGridContainer = GridContainer.create();
    const expectedGridItem = GridItem.create({
      sizes: [Size.create({ breakpoint: Breakpoints.sm(), colSpan: 4 })],
    });
    expectedGridItem.replaceContent(DataFieldRef.create({ fieldId: 'f1' }));

    expectedGridContainer.addGridItem(expectedGridItem);
    expect(view.toPlain().nodes).toEqual(
      ignoreIds([
        expectedGridContainer.toPlain(),
        SectionGrid.create({ sectionId: 'sectionId', cols: 1 }).toPlain(),
      ]),
    );
  });

  it('finds node by id', () => {
    const view = View.create({ name: 'My layout', userId, organizationId });
    const gridContainer1 = GridContainer.create({ cols: 3 });
    const gridContainer2 = GridContainer.create({ cols: 3 });
    view.addNode(gridContainer1);
    view.addNode(gridContainer2);
    expect(view.findNodeOrFail(gridContainer1.id)).toEqual(gridContainer1);
    expect(view.findNodeOrFail(gridContainer2.id)).toEqual(gridContainer2);
    expect(() => view.findNodeOrFail('not-existing-id')).toThrow(
      new NotFoundError(Node.name, 'not-existing-id'),
    );
  });
});
