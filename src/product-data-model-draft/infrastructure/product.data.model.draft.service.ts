import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDataModelDraftDoc } from './product.data.model.draft.schema';
import { ProductDataModelDraft } from '../domain/product.data.model.draft';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';

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
          })),
        })),
        createdByUserId: productDataModel.createdByUserId,
        ownedByOrganizationId: productDataModel.ownedByOrganizationId,
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if none found
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
        })),
      })),
      publications: plainDoc.publications,
      createdByUserId: plainDoc.createdByUserId,
      ownedByOrganizationId: plainDoc.ownedByOrganizationId,
    });
  }

  async findOne(id: string) {
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
