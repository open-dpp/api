import { DataFieldRef, NodeType, SectionGrid } from './node';
import { TargetGroup, View } from './view';
import { randomUUID } from 'crypto';
import { ValueError } from '../../exceptions/domain.errors';

describe('View', () => {
  const dataModelId = randomUUID();
  const colStartAndSpan = { colStart: { md: 2 }, colSpan: { md: 3 } };
  it('is created and nodes on different level are added', () => {
    const view = View.create({
      targetGroup: TargetGroup.ALL,
      dataModelId,
    });
    expect(view.id).toEqual(expect.any(String));
    expect(view.targetGroup).toEqual(TargetGroup.ALL);
    expect(view.version).toEqual('1.0.0');
    expect(view.dataModelId).toEqual(dataModelId);
    const sectionGrid1 = SectionGrid.create({
      cols: { sm: 3 },
      sectionId: randomUUID(),
      ...colStartAndSpan,
    });
    const sectionGrid2 = SectionGrid.create({
      cols: { sm: 3 },
      sectionId: randomUUID(),
      ...colStartAndSpan,
    });
    view.addNode(sectionGrid1);
    view.addNode(sectionGrid2);
    expect(view.nodes).toEqual([sectionGrid1, sectionGrid2]);
    const dataFieldRef1 = DataFieldRef.create({
      fieldId: 'f1',
      ...colStartAndSpan,
    });
    view.addNode(dataFieldRef1, sectionGrid1.id);
    expect(sectionGrid1.children).toEqual([dataFieldRef1.id]);

    // Check validations
    expect(() =>
      view.addNode(
        DataFieldRef.create({
          fieldId: randomUUID(),
          ...colStartAndSpan,
        }),
        dataFieldRef1.id,
      ),
    ).toThrow(
      new ValueError('DataFieldRef could not be added to DataFieldRef'),
    );
    expect(() => view.addNode(dataFieldRef1, 'unknown-parent-id')).toThrow(
      new ValueError(
        `Parent unknown-parent-id to add node to could not be found`,
      ),
    );
    expect(() => view.addNode(dataFieldRef1)).toThrow(
      new ValueError(`Cannot add ${NodeType.DATA_FIELD_REF} at root level`),
    );
  });

  const plain = {
    id: randomUUID(),
    version: '1.0.0',
    dataModelId: 'dataModelId',
    targetGroup: TargetGroup.ALL,
    nodes: [
      {
        id: 's1',
        type: NodeType.SECTION_GRID,
        sectionId: 'sectionId1',
        cols: { sm: 1 },
        ...colStartAndSpan,
        children: ['df11'],
      },
      {
        id: 'df11',
        type: NodeType.DATA_FIELD_REF,
        ...colStartAndSpan,
        fieldId: 'f11',
        parentId: 's1',
        children: [],
      },
      {
        id: 's2',
        type: NodeType.SECTION_GRID,
        sectionId: 'sectionId2',
        ...colStartAndSpan,
        cols: { lg: 2 },
        children: ['s21', 'df22'],
      },
      {
        id: 's21',
        type: NodeType.SECTION_GRID,
        sectionId: 'sectionId21',
        ...colStartAndSpan,
        cols: { xs: 2 },
        parentId: 's2',
        children: ['df211'],
      },
      {
        id: 'df211',
        type: NodeType.DATA_FIELD_REF,
        fieldId: 'f211',
        ...colStartAndSpan,
        parentId: 's21',
        children: [],
      },
      {
        id: 'df22',
        type: NodeType.DATA_FIELD_REF,
        fieldId: 'f22',
        ...colStartAndSpan,
        parentId: 's2',
        children: [],
      },
    ],
  };
  //
  it('is created from plain', () => {
    const view = View.create({
      dataModelId: 'dataModelId',
      targetGroup: TargetGroup.ALL,
    });

    // first level
    const sectionGrid1 = SectionGrid.fromPlain({
      id: 's1',
      sectionId: 'sectionId1',
      cols: { sm: 1 },
      ...colStartAndSpan,
    });
    view.addNode(sectionGrid1);

    const sectionGrid2 = SectionGrid.fromPlain({
      id: 's2',
      sectionId: 'sectionId2',
      cols: { lg: 2 },
      ...colStartAndSpan,
    });
    view.addNode(sectionGrid2);

    // second level

    const dataFieldRef11 = DataFieldRef.fromPlain({
      id: 'df11',
      ...colStartAndSpan,
      fieldId: 'f11',
    });
    view.addNode(dataFieldRef11, sectionGrid1.id);

    const sectionGrid21 = SectionGrid.fromPlain({
      id: 's21',
      sectionId: 'sectionId21',
      cols: { xs: 2 },
      ...colStartAndSpan,
    });
    view.addNode(sectionGrid21, sectionGrid2.id);

    const dataFieldRef22 = DataFieldRef.fromPlain({
      id: 'df22',
      ...colStartAndSpan,
      fieldId: 'f22',
    });
    view.addNode(dataFieldRef22, sectionGrid2.id);

    // third level

    const dataFieldRef211 = DataFieldRef.fromPlain({
      id: 'df211',
      ...colStartAndSpan,
      fieldId: 'f211',
    });
    view.addNode(dataFieldRef211, sectionGrid21.id);

    expect(View.fromPlain(plain).toPlain({ sortNodesById: true })).toEqual({
      ...view.toPlain({ sortNodesById: true }),
      id: expect.any(String),
    });
  });

  it('is published', () => {
    const view = View.fromPlain(plain);
    const publishedModelId = 'publishedModelId';
    const publishedView = view.publish(publishedModelId);
    expect(publishedView.toPlain()).toEqual({
      ...view.toPlain(),
      dataModelId: publishedModelId,
      id: expect.any(String),
    });
    expect(publishedView.id).not.toEqual(view.id);
    expect(publishedView.dataModelId).not.toEqual(view.dataModelId);
  });

  it('finds node', () => {
    const view = View.fromPlain(plain);

    // find by section id
    let found = view.findNodeWithParentBySectionId('sectionId1');
    expect(found.node.id).toEqual('s1');
    expect(found.parent).toBeUndefined();

    found = view.findNodeWithParentBySectionId('sectionId21');
    expect(found.node.id).toEqual('s21');
    expect(found.parent.id).toEqual('s2');

    // find by field id
    found = view.findNodeWithParentByFieldId('f11');
    expect(found.node.id).toEqual('df11');
    expect(found.parent.id).toEqual('s1');

    found = view.findNodeWithParentByFieldId('f211');
    expect(found.node.id).toEqual('df211');
    expect(found.parent.id).toEqual('s21');

    // find by id
    found = view.findNodeWithParentById('s1');
    expect(found.node.id).toEqual('s1');
    expect(found.parent).toBeUndefined();

    found = view.findNodeWithParentById('df211');
    expect(found.node.id).toEqual('df211');
    expect(found.parent.id).toEqual('s21');

    // nothing could be found
    found = view.findNodeWithParentById('unknown id');
    expect(found.node).toBeUndefined();
    expect(found.parent).toBeUndefined();
  });
  //
  it('deletes node', () => {
    const view = View.fromPlain(plain);

    const foundBeforeDelete = view.findNodeWithParentById('df22');
    view.deleteNodeById('df22');
    let foundAfterDelete = view.findNodeWithParentById('df22');
    expect(foundAfterDelete.node).toBeUndefined();
    expect(foundBeforeDelete.parent.children).not.toContain('df22');

    view.deleteNodeById('s2');
    foundAfterDelete = view.findNodeWithParentById('s2');
    expect(foundAfterDelete.node).toBeUndefined();
    // check that all nested childs have been deleted
    expect(view.findNodeWithParentById('s21').node).toBeUndefined();
    expect(view.findNodeWithParentById('df22').node).toBeUndefined();
    expect(view.findNodeWithParentById('df221').node).toBeUndefined();

    expect(view.toPlain().nodes).toEqual([
      {
        id: 's1',
        type: NodeType.SECTION_GRID,
        sectionId: 'sectionId1',
        cols: { sm: 1 },
        ...colStartAndSpan,
        children: ['df11'],
      },
      {
        id: 'df11',
        type: NodeType.DATA_FIELD_REF,
        ...colStartAndSpan,
        fieldId: 'f11',
        parentId: 's1',
        children: [],
      },
    ]);
  });
});
