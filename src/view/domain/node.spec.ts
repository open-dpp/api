import { DataFieldRef, NodeType, SectionGrid } from './node';
import { randomUUID } from 'crypto';
import { ValueError } from '../../exceptions/domain.errors';

describe('DataFieldRef', () => {
  it('should be created', () => {
    const dataFieldRef = DataFieldRef.create({
      fieldId: 'f1',
      colStart: { md: 2 },
      colSpan: { md: 3 },
      rowStart: { xs: 5 },
      rowSpan: { lg: 9 },
    });
    expect(dataFieldRef.fieldId).toEqual('f1');
    expect(dataFieldRef.colStart).toEqual({ md: 2 });
    expect(dataFieldRef.colSpan).toEqual({ md: 3 });
    expect(dataFieldRef.rowStart).toEqual({ xs: 5 });
    expect(dataFieldRef.rowSpan).toEqual({ lg: 9 });
  });
});

describe('GridContainer', () => {
  it('should be created', () => {
    const sectionGrid = SectionGrid.create({
      sectionId: 's1',
      colStart: { md: 2 },
      colSpan: { md: 3 },
      cols: { md: 3 },
      rowStart: { xs: 5 },
      rowSpan: { lg: 9 },
    });
    expect(sectionGrid.sectionId).toEqual('s1');
    expect(sectionGrid.colStart).toEqual({ md: 2 });
    expect(sectionGrid.colSpan).toEqual({ md: 3 });
    expect(sectionGrid.cols).toEqual({ md: 3 });
    expect(sectionGrid.rowStart).toEqual({ xs: 5 });
    expect(sectionGrid.rowSpan).toEqual({ lg: 9 });
  });

  it('should be created with nested items', () => {
    const sectionId = randomUUID();
    const sectionGrid = SectionGrid.create({
      colStart: { md: 2 },
      colSpan: { md: 3 },
      cols: { md: 3 },
      sectionId,
    });
    const gridItem1 = DataFieldRef.create({
      colStart: { lg: 1 },
      colSpan: { md: 4 },
      fieldId: randomUUID(),
    });
    sectionGrid.addNode(gridItem1);
    expect(sectionGrid.children).toEqual([gridItem1.id]);

    const subSectionGrid = SectionGrid.create({
      colStart: { md: 2 },
      colSpan: { md: 3 },
      cols: { md: 3 },
      sectionId: randomUUID(),
    });

    sectionGrid.addNode(subSectionGrid);

    expect(sectionGrid.children).toEqual([gridItem1.id, subSectionGrid.id]);
    expect(subSectionGrid.parentId).toEqual(sectionGrid.id);

    expect(sectionGrid.toPlain()).toEqual({
      id: expect.any(String),
      type: NodeType.SECTION_GRID,
      colStart: { md: 2 },
      colSpan: { md: 3 },
      cols: { md: 3 },
      sectionId,
      children: [gridItem1.id, subSectionGrid.id],
    });
  });

  //
  it.each([2.2, 13, -1])(
    'should throw error for not supported cols',
    (cols) => {
      expect(() =>
        SectionGrid.create({
          colStart: { md: cols },
          colSpan: { md: cols },
          cols: { md: cols },
          sectionId: randomUUID(),
        }),
      ).toThrow(ValueError);
    },
  );

  it('should throw error if same node is added twice', () => {
    const sectionGrid = SectionGrid.create({
      colStart: { md: 2 },
      colSpan: { md: 3 },
      cols: { md: 3 },
      sectionId: randomUUID(),
    });
    const dataFieldRef = DataFieldRef.create({
      colStart: { lg: 1 },
      colSpan: { md: 4 },
      fieldId: randomUUID(),
    });
    sectionGrid.addNode(dataFieldRef);
    expect(() => sectionGrid.addNode(dataFieldRef)).toThrow(
      new ValueError(`Node with ${dataFieldRef.id} is already child.`),
    );
  });

  it('should delete node', () => {
    const sectionGrid = SectionGrid.create({
      colStart: { md: 2 },
      colSpan: { md: 3 },
      cols: { md: 3 },
      sectionId: randomUUID(),
    });
    const dataFieldRef1 = DataFieldRef.create({
      colStart: { lg: 1 },
      colSpan: { md: 4 },
      fieldId: randomUUID(),
    });
    const dataFieldRef2 = DataFieldRef.create({
      colStart: { lg: 1 },
      colSpan: { md: 4 },
      fieldId: randomUUID(),
    });
    sectionGrid.addNode(dataFieldRef1);
    sectionGrid.addNode(dataFieldRef2);
    const result = sectionGrid.deleteNode(dataFieldRef1);
    expect(sectionGrid.children).toEqual([dataFieldRef2.id]);
    expect(result.parentId).toBeUndefined();
    // errors
    expect(() => sectionGrid.deleteNode(dataFieldRef1)).toThrow(
      new ValueError(
        `Could not found and delete node ${dataFieldRef1.id} from ${sectionGrid.id}`,
      ),
    );
  });

  it('should modify col and row config', () => {
    const sectionGrid = SectionGrid.create({
      colStart: { md: 2 },
      colSpan: { md: 3 },
      cols: { md: 3 },
      sectionId: randomUUID(),
    });
    const modifications = {
      colStart: { xs: 2 },
      colSpan: { lg: 3 },
      rowSpan: { sm: 1 },
      rowStart: { sm: 3 },
    };
    sectionGrid.modifyConfigs(modifications);
    sectionGrid.modifyCols({ sm: 6, md: 10 });
    expect(sectionGrid.toPlain()).toEqual({
      ...sectionGrid.toPlain(),
      ...modifications,
    });

    // if no value is provided the current defined should be used
    sectionGrid.modifyConfigs({});
    expect(sectionGrid.toPlain()).toEqual({
      ...sectionGrid.toPlain(),
      ...modifications,
    });
  });
});
