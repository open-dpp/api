import {
  TemplateDoc,
  TemplateDocSchemaVersion,
} from '../infrastructure/template.schema';
import {
  DataFieldDoc,
  SectionDoc,
} from '../../data-modelling/infrastructure/product-data-model-base.schema';
import { DataSectionDbProps } from './section';
import { DataFieldDbProps } from './data-field';
import { Template } from './template';
import { SectionType } from '../../data-modelling/domain/section-base';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';

export function serializeTemplate(template: Template) {
  return {
    _id: template.id,
    name: template.name,
    description: template.description,
    sectors: template.sectors,
    version: template.version,
    _schemaVersion: TemplateDocSchemaVersion.v1_0_1,
    sections: template.sections.map((s) => ({
      _id: s.id,
      name: s.name,
      type: s.type,
      granularityLevel: s.granularityLevel,
      dataFields: s.dataFields.map((d) => ({
        _id: d.id,
        name: d.name,
        type: d.type,
        options: d.options,
        layout: d.layout,
        granularityLevel: d.granularityLevel,
      })),
      layout: s.layout,
      subSections: s.subSections,
      parentId: s.parentId,
    })),
    createdByUserId: template.createdByUserId,
    ownedByOrganizationId: template.ownedByOrganizationId,
    marketplaceResourceId: template.marketplaceResourceId,
  };
}

export function deserializeTemplate(plain: TemplateDoc) {
  const tmp = {
    id: plain._id,
    marketplaceResourceId: plain.marketplaceResourceId,
    name: plain.name,
    description: plain.description,
    sectors: plain.sectors,
    version: plain.version,
    userId: plain.createdByUserId,
    organizationId: plain.ownedByOrganizationId,
    sections: plain.sections.map((s: SectionDoc) => createSection(s)),
  };
  return Template.loadFromDb(tmp);
}

function createSection(sectionDoc: SectionDoc): DataSectionDbProps {
  return {
    id: sectionDoc._id,
    type: sectionDoc.type,
    name: sectionDoc.name,
    parentId: sectionDoc.parentId,
    subSections: sectionDoc.subSections,
    dataFields: sectionDoc.dataFields.map((df) => createDataField(df)),
    layout: {
      cols: sectionDoc.layout.cols,
      colStart: sectionDoc.layout.colStart,
      colSpan: sectionDoc.layout.colSpan,
      rowStart: sectionDoc.layout.rowStart,
      rowSpan: sectionDoc.layout.rowSpan,
    },
    granularityLevel: sectionDoc.granularityLevel
      ? sectionDoc.granularityLevel
      : sectionDoc.type === SectionType.REPEATABLE
        ? GranularityLevel.MODEL
        : undefined,
  };
}

function createDataField(dataFieldDoc: DataFieldDoc): DataFieldDbProps {
  return {
    id: dataFieldDoc._id,
    type: dataFieldDoc.type,
    layout: {
      colStart: dataFieldDoc.layout.colStart,
      colSpan: dataFieldDoc.layout.colSpan,
      rowStart: dataFieldDoc.layout.rowStart,
      rowSpan: dataFieldDoc.layout.rowSpan,
    },
    granularityLevel: dataFieldDoc.granularityLevel,
    options: dataFieldDoc.options,
    name: dataFieldDoc.name,
  };
}
