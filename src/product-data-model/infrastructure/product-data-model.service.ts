import { Injectable } from '@nestjs/common';
import {
  ProductDataModel,
  serialize,
  VisibilityLevel,
} from '../domain/product.data.model';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDataModelDoc } from './product-data-model.schema';
import {
  DataFieldDoc,
  SectionDoc,
} from '../../data-modelling/infrastructure/product-data-model-base.schema';
import {
  DataField,
  findDataFieldClassByTypeOrFail,
} from '../domain/data-field';
import { Layout } from '../../data-modelling/domain/layout';
import { DataSection, findSectionClassByTypeOrFail } from '../domain/section';

@Injectable()
export class ProductDataModelService {
  constructor(
    @InjectModel(ProductDataModelDoc.name)
    private productDataModelDoc: Model<ProductDataModelDoc>,
  ) {}

  createDataField(dataFieldDoc: DataFieldDoc): DataField {
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

  createSection(sectionDoc: SectionDoc): DataSection {
    const sharedProps = {
      id: sectionDoc._id,
      name: sectionDoc.name,
      parentId: sectionDoc.parentId,
      subSections: sectionDoc.subSections,
      dataFields: sectionDoc.dataFields.map((df) => this.createDataField(df)),
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

  convertToDomain(productDataModelDoc: ProductDataModelDoc): ProductDataModel {
    const plain = productDataModelDoc.toObject();
    return ProductDataModel.loadFromDb({
      id: plain._id,
      name: plain.name,
      version: plain.version,
      createdByUserId: plain.createdByUserId,
      ownedByOrganizationId: plain.ownedByOrganizationId,
      visibility: plain.visibility,
      sections: plain.sections.map((s: SectionDoc) => this.createSection(s)),
    });
  }

  async save(productDataModel: ProductDataModel) {
    const { _id, ...rest } = serialize(productDataModel);
    const dataModelDoc = await this.productDataModelDoc.findOneAndUpdate(
      { _id },
      rest,
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if none found
        runValidators: true,
      },
    );

    return this.convertToDomain(dataModelDoc);
  }

  async findByName(name: string) {
    const foundDataModelDocs = await this.productDataModelDoc
      .find({ name: name }, '_id name version')
      .sort({ name: 1 })
      .exec();
    return foundDataModelDocs.map((dm) => ({
      id: dm._id,
      name: dm.name,
      version: dm.version,
    }));
  }

  async findAllAccessibleByOrganization(organizationId: string) {
    const foundDataModelDocs = await this.productDataModelDoc
      .find(
        {
          $or: [
            { ownedByOrganizationId: organizationId },
            { visibility: VisibilityLevel.PUBLIC },
          ],
        },
        '_id name version',
      )
      .sort({ name: 1 })
      .exec();
    return foundDataModelDocs.map((dm) => ({
      id: dm._id,
      name: dm.name,
      version: dm.version,
    }));
  }

  async findOneOrFail(id: string) {
    const productEntity = await this.productDataModelDoc.findById(id);
    if (!productEntity) {
      throw new NotFoundInDatabaseException(ProductDataModel.name);
    }
    return this.convertToDomain(productEntity);
  }
}
