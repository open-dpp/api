import {
  Breakpoints,
  DataFieldRef,
  GridContainer,
  GridItem,
  NodeType,
  SectionGrid,
  Size,
} from './node';
import { View } from './view';
import { ignoreIds } from '../../../test/utils';
import { randomUUID } from 'crypto';
import { ValueError } from '../../exceptions/domain.errors';

describe('View', () => {
  const userId = randomUUID();
  const organizationId = randomUUID();
  it('is created and nodes on different level are added', () => {
    const view = View.create({ name: 'My layout', userId, organizationId });
    expect(view.id).toEqual(expect.any(String));
    expect(view.name).toEqual('My layout');
    expect(view.version).toEqual('1.0.0');
    const gridContainer1 = GridContainer.create({ cols: 3 });
    const gridContainer2 = GridContainer.create();
    view.addNode(gridContainer1);
    view.addNode(gridContainer2);
    expect(view.nodes).toEqual([gridContainer1, gridContainer2]);
    const gridItem = GridItem.create({
      sizes: [Size.create({ breakpoint: Breakpoints.sm, colSpan: 4 })],
    });
    view.addNode(gridItem, gridContainer2.id);
    expect(gridContainer2.getChildNodes()).toEqual([gridItem]);
    const dataFieldRef = DataFieldRef.create({ fieldId: 'f1' });
    view.addNode(dataFieldRef, gridItem.id);
    expect(gridItem.getChildNodes()).toEqual([dataFieldRef]);
    expect(() => view.addNode(gridItem, dataFieldRef.id)).toThrow(
      new ValueError('GridItem could not be added to DataFieldRef'),
    );
    expect(() => view.addNode(gridItem, 'unknown parent id')).toThrow(
      new ValueError(
        `Parent unknown parent id to add node to could not be found`,
      ),
    );
    expect(() => view.addNode(dataFieldRef)).toThrow(
      new ValueError(`Cannot add ${NodeType.DATA_FIELD_REF} at root level`),
    );
  });

  it('is created from plain', () => {
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
              sizes: [{ breakpoint: Breakpoints.sm, colSpan: 4 }],
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
              sizes: [{ breakpoint: Breakpoints.sm, colSpan: 12 }],
            },
          ],
        },
      ],
    };
    const view = View.fromPlain(plain);
    const expectedGridContainer = GridContainer.create();
    const expectedGridItem = GridItem.create({
      sizes: [Size.create({ breakpoint: Breakpoints.sm, colSpan: 4 })],
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

  it('finds node', () => {
    const view = View.create({ name: 'My layout', userId, organizationId });
    const gridContainer = GridContainer.create();
    const size = Size.create({ breakpoint: Breakpoints.md, colSpan: 4 });
    const dataFieldItem = DataFieldRef.create({ fieldId: randomUUID() });
    const gridItem1 = GridItem.create({
      sizes: [size],
      content: dataFieldItem,
    });
    gridContainer.addGridItem(gridItem1);

    const subGridContainer = GridContainer.create();
    const subDataFieldItem = DataFieldRef.create({ fieldId: randomUUID() });
    const subGridItem = GridItem.create({
      sizes: [Size.create({ breakpoint: Breakpoints.sm, colSpan: 12 })],
      content: subDataFieldItem,
    });
    subGridContainer.addGridItem(subGridItem);

    const gridItem2 = GridItem.create({
      sizes: [size],
      content: subGridContainer,
    });
    gridContainer.addGridItem(gridItem2);

    view.addNode(gridContainer);

    expect(view.findNodeWithParentById(gridContainer.id)).toEqual({
      node: gridContainer,
      parent: undefined,
    });

    expect(view.findNodeWithParentById(gridItem1.id)).toEqual({
      node: gridItem1,
      parent: gridContainer,
    });
    expect(view.findNodeWithParentById(gridItem2.id)).toEqual({
      node: gridItem2,
      parent: gridContainer,
    });
    expect(view.findNodeWithParentById(dataFieldItem.id)).toEqual({
      node: dataFieldItem,
      parent: gridItem1,
    });
    expect(view.findNodeWithParentById(subGridContainer.id)).toEqual({
      node: subGridContainer,
      parent: gridItem2,
    });
    expect(view.findNodeWithParentById(subGridItem.id)).toEqual({
      node: subGridItem,
      parent: subGridContainer,
    });
    expect(view.findNodeWithParentById(subDataFieldItem.id)).toEqual({
      node: subDataFieldItem,
      parent: subGridItem,
    });
    expect(view.findNodeWithParentById('unknown id')).toBeUndefined();
  });

  it('deletes node', () => {
    const view = View.create({ name: 'My layout', userId, organizationId });
    const gridContainer = GridContainer.create();
    const size = Size.create({ breakpoint: Breakpoints.md, colSpan: 4 });
    const dataFieldItem = DataFieldRef.create({ fieldId: 'f1' });
    const gridItem1 = GridItem.create({
      sizes: [size],
      content: dataFieldItem,
    });
    gridContainer.addGridItem(gridItem1);

    const subGridContainer = GridContainer.create();
    const subDataFieldItem = DataFieldRef.create({ fieldId: 'subf1' });
    const subGridItem = GridItem.create({
      sizes: [Size.create({ breakpoint: Breakpoints.sm, colSpan: 12 })],
      content: subDataFieldItem,
    });
    subGridContainer.addGridItem(subGridItem);

    const gridItem2 = GridItem.create({
      sizes: [size],
      content: subGridContainer,
    });
    gridContainer.addGridItem(gridItem2);
    view.addNode(gridContainer);

    const gridContainer2 = GridContainer.create();
    const dataFieldItem2 = DataFieldRef.create({ fieldId: 'f2' });
    gridContainer2.addGridItem(
      GridItem.create({
        sizes: [size],
        content: dataFieldItem2,
      }),
    );
    view.addNode(gridContainer2);

    expect(view.deleteNodeById(subGridContainer.id)).toBeTruthy();
    expect(view.findNodeWithParentById(subGridContainer.id)).toBeUndefined();
    expect(view.findNodeWithParentById(subDataFieldItem.id)).toBeUndefined();
    expect(gridItem2.getChildNodes()).toEqual([]);
    expect(view.deleteNodeById(dataFieldItem.id)).toBeTruthy();
    expect(gridItem1.content).toBeUndefined();
    expect(view.deleteNodeById('unknown id')).toBeFalsy();
    expect(view.deleteNodeById(gridItem2.id)).toBeTruthy();
    expect(view.deleteNodeById(gridContainer2.id)).toBeTruthy();
    expect(view.toPlain()).toEqual({
      id: view.id,
      name: view.name,
      version: '1.0.0',
      ownedByOrganizationId: organizationId,
      createdByUserId: userId,
      nodes: [
        {
          id: gridContainer.id,
          type: NodeType.GRID_CONTAINER,
          children: [
            {
              id: gridItem1.id,
              type: NodeType.GRID_ITEM,
              sizes: [size],
              content: undefined,
            },
          ],
        },
      ],
    });
  });
});
