import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ProductDataModelDraftDoc,
  ProductDataModelDraftDocSchemaVersion,
} from './product-data-model-draft.schema';
import { ProductDataModelDraft } from '../domain/product-data-model-draft';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { SectionType } from '../../data-modelling/domain/section-base';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';

@Injectable()
export class ProductDataModelDraftService {
  constructor(
    @InjectModel(ProductDataModelDraftDoc.name)
    private productDataModelDraftDoc: Model<ProductDataModelDraftDoc>,
  ) {}

  async save(
    productDataModel: ProductDataModelDraft,
  ): Promise<ProductDataModelDraft> {
    const draftDoc = await this.productDataModelDraftDoc.findOneAndUpdate(
      { _id: productDataModel.id },
      {
        name: productDataModel.name,
        version: productDataModel.version,
        _schemaVersion: ProductDataModelDraftDocSchemaVersion.v1_0_1,
        publications: productDataModel.publications,
        sections: productDataModel.sections.map((s) => ({
          _id: s.id,
          name: s.name,
          type: s.type,
          dataFields: s.dataFields.map((d) => ({
            _id: d.id,
            name: d.name,
            type: d.type,
            options: d.options,
            layout: d.layout,
            granularityLevel: d.granularityLevel,
          })),
          parentId: s.parentId,
          layout: s.layout,
          subSections: s.subSections,
          granularityLevel: s.granularityLevel,
        })),
        createdByUserId: productDataModel.createdByUserId,
        ownedByOrganizationId: productDataModel.ownedByOrganizationId,
      },
      {
        new: true, // Return the updated document
        upsert: true,
        runValidators: true,
      },
    );

    return this.convertToDomain(draftDoc);
  }

  convertToDomain(productDataModelDraftDoc: ProductDataModelDraftDoc) {
    const plainDoc = productDataModelDraftDoc.toObject();

    return ProductDataModelDraft.fromPlain({
      id: plainDoc._id,
      name: plainDoc.name,
      version: plainDoc.version,
      sections: plainDoc.sections.map((s) => ({
        id: s._id,
        name: s.name,
        type: s.type,
        dataFields: s.dataFields.map((f) => ({
          id: f._id,
          type: f.type,
          name: f.name,
          options: f.options,
          layout: f.layout,
          granularityLevel: f.granularityLevel,
        })),
        layout: s.layout,
        subSections: s.subSections,
        parentId: s.parentId,
        granularityLevel: s.granularityLevel
          ? s.granularityLevel
          : s.type === SectionType.REPEATABLE
            ? GranularityLevel.MODEL
            : undefined,
      })),
      publications: plainDoc.publications,
      createdByUserId: plainDoc.createdByUserId,
      ownedByOrganizationId: plainDoc.ownedByOrganizationId,
    });
  }

  async findOneOrFail(id: string) {
    const draftDoc = await this.productDataModelDraftDoc.findById(id).exec();
    if (!draftDoc) {
      throw new NotFoundInDatabaseException(ProductDataModelDraft.name);
    }
    return this.convertToDomain(draftDoc);
  }

  async findAllByOrganization(organizationId: string) {
    return (
      await this.productDataModelDraftDoc
        .find({ ownedByOrganizationId: organizationId }, '_id name')
        .sort({ name: 1 })
        .exec()
    ).map((p) => {
      const plain = p.toObject();
      return { id: plain._id, name: plain.name };
    });
  }
}
