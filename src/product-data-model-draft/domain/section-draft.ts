import { DataFieldDraft } from './data-field-draft';
import {
  DataSectionBase,
  SectionType,
} from '../../data-modelling/domain/section-base';
import { NotFoundError, ValueError } from '../../exceptions/domain.errors';
import { Layout, LayoutProps } from '../../data-modelling/domain/layout';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { randomUUID } from 'crypto';
import {
  DataSection,
  findSectionClassByTypeOrFail,
} from '../../product-data-model/domain/section';

export class DataSectionDraft extends DataSectionBase {
  private constructor(
    public readonly id: string,
    protected _name: string,
    public readonly type: SectionType,
    public readonly layout: Layout,
    protected _subSections: string[],
    protected _parentId: string | undefined,
    public granularityLevel: GranularityLevel | undefined,
    public readonly dataFields: DataFieldDraft[],
  ) {
    super(id, _name, type, layout, _subSections, _parentId, granularityLevel);
  }

  static create(data: {
    name: string;
    type: SectionType;
    layout: Layout;
    granularityLevel?: GranularityLevel;
  }) {
    if (data.type === SectionType.REPEATABLE && !data.granularityLevel) {
      throw new ValueError(`Repeatable must have a granularity level`);
    }
    return new DataSectionDraft(
      randomUUID(),
      data.name,
      data.type,
      data.layout,
      [],
      undefined,
      data.granularityLevel,
      [],
    );
  }

  static loadFromDb(data: {
    id: string;
    name: string;
    type: SectionType;
    layout: Layout;
    subSections: string[];
    parentId: string | undefined;
    dataFields: DataFieldDraft[];
    granularityLevel?: GranularityLevel;
  }) {
    return new DataSectionDraft(
      data.id,
      data.name,
      data.type,
      data.layout,
      data.subSections,
      data.parentId,
      data.granularityLevel,
      data.dataFields,
    );
  }

  assignParent(parent: DataSectionDraft) {
    this._parentId = parent.id;
  }

  removeParent() {
    this._parentId = undefined;
  }

  rename(newName: string) {
    this._name = newName;
  }

  addDataField(dataField: DataFieldDraft) {
    if (
      this.granularityLevel &&
      this.granularityLevel !== dataField.granularityLevel
    ) {
      throw new ValueError(
        `Data field ${dataField.id} has a granularity level of ${dataField.granularityLevel} which does not match the section's granularity level of ${this.granularityLevel}`,
      );
    }
    this.dataFields.push(dataField);
  }

  addSubSection(section: DataSectionDraft) {
    this._subSections.push(section.id);
    section.assignParent(this);
  }

  deleteSubSection(subSection: DataSectionDraft) {
    if (!this.subSections.find((id) => id === subSection.id)) {
      throw new ValueError(
        `Could not found and delete sub section ${subSection.id} from ${this.id}`,
      );
    }
    this._subSections = this.subSections.filter((n) => n !== subSection.id);
    subSection.removeParent();
    return subSection;
  }

  modifyDataField(
    dataFieldId: string,
    data: {
      name?: string;
      options?: Record<string, unknown>;
      layout: Partial<LayoutProps>;
    },
  ) {
    const found = this.dataFields.find((d) => d.id === dataFieldId);
    if (!found) {
      throw new NotFoundError(DataFieldDraft.name, dataFieldId);
    }
    if (data.name) {
      found.rename(data.name);
    }
    if (data.options) {
      found.mergeOptions(data.options);
    }
    if (data.layout) {
      found.layout.modify(data.layout);
    }
  }

  deleteDataField(dataFieldId: string) {
    const foundIndex = this.dataFields.findIndex((d) => d.id === dataFieldId);
    if (foundIndex < 0) {
      throw new NotFoundError(DataFieldDraft.name, dataFieldId);
    }
    this.dataFields.splice(foundIndex, 1);
  }

  publish(): DataSection {
    const SectionClass = findSectionClassByTypeOrFail(this.type);
    return SectionClass.loadFromDb({
      id: this.id,
      name: this.name,
      parentId: this.parentId,
      subSections: this.subSections,
      layout: this.layout,
      dataFields: this.dataFields.map((d) => d.publish()),
      granularityLevel: this.granularityLevel,
    });
  }
}
