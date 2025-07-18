import {
  ProductDataModelDoc,
  ProductDataModelDocSchemaVersion,
} from '../infrastructure/product-data-model.schema';
import {
  DataFieldDoc,
  SectionDoc,
} from '../../data-modelling/infrastructure/product-data-model-base.schema';
import { DataSection, findSectionClassByTypeOrFail } from './section';
import { Layout } from '../../data-modelling/domain/layout';
import { DataField, findDataFieldClassByTypeOrFail } from './data-field';
import { ProductDataModel } from './product.data.model';

export function serializeProductDataModel(productDataModel: ProductDataModel) {
  return {
    _id: productDataModel.id,
    name: productDataModel.name,
    version: productDataModel.version,
    visibility: productDataModel.visibility,
    _schemaVersion: ProductDataModelDocSchemaVersion.v1_0_1,
    sections: productDataModel.sections.map((s) => ({
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
    createdByUserId: productDataModel.createdByUserId,
    ownedByOrganizationId: productDataModel.ownedByOrganizationId,
    marketplaceResourceId: productDataModel.marketplaceResourceId,
  };
}

export function deserializeProductDataModel(plain: ProductDataModelDoc) {
  return ProductDataModel.loadFromDb({
    id: plain._id,
    marketplaceResourceId: plain.marketplaceResourceId,
    name: plain.name,
    version: plain.version,
    createdByUserId: plain.createdByUserId,
    ownedByOrganizationId: plain.ownedByOrganizationId,
    visibility: plain.visibility,
    sections: plain.sections.map((s: SectionDoc) => createSection(s)),
  });
}

function createSection(sectionDoc: SectionDoc): DataSection {
  const sharedProps = {
    id: sectionDoc._id,
    name: sectionDoc.name,
    parentId: sectionDoc.parentId,
    subSections: sectionDoc.subSections,
    dataFields: sectionDoc.dataFields.map((df) => createDataField(df)),
    layout: Layout.create({
      cols: sectionDoc.layout.cols,
      colStart: sectionDoc.layout.colStart,
      colSpan: sectionDoc.layout.colSpan,
      rowStart: sectionDoc.layout.rowStart,
      rowSpan: sectionDoc.layout.rowSpan,
    }),
    granularityLevel: sectionDoc.granularityLevel,
  };
  const SectionClass = findSectionClassByTypeOrFail(sectionDoc.type);
  return SectionClass.loadFromDb(sharedProps);
}

function createDataField(dataFieldDoc: DataFieldDoc): DataField {
  const sharedProps = {
    id: dataFieldDoc._id,
    layout: Layout.create({
      colStart: dataFieldDoc.layout.colStart,
      colSpan: dataFieldDoc.layout.colSpan,
      rowStart: dataFieldDoc.layout.rowStart,
      rowSpan: dataFieldDoc.layout.rowSpan,
    }),
    granularityLevel: dataFieldDoc.granularityLevel,
    options: dataFieldDoc.options,
    name: dataFieldDoc.name,
  };
  const DataFieldClass = findDataFieldClassByTypeOrFail(dataFieldDoc.type);
  return DataFieldClass.loadFromDb(sharedProps);
}
