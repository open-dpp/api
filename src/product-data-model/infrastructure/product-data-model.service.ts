import { Injectable } from '@nestjs/common';
import {
  ProductDataModel,
  VisibilityLevel,
} from '../domain/product.data.model';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { Organization } from '../../organizations/domain/organization';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDataModelDoc } from './product-data-model.schema';

@Injectable()
export class ProductDataModelService {
  constructor(
    @InjectModel(ProductDataModelDoc.name)
    private productDataModelDoc: Model<ProductDataModelDoc>,
  ) {}

  convertToDomain(productDataModelDoc: ProductDataModelDoc) {
    return ProductDataModel.fromPlain({
      id: productDataModelDoc._id,
      name: productDataModelDoc.name,
      version: productDataModelDoc.version,
      createdByUserId: productDataModelDoc.createdByUserId,
      ownedByOrganizationId: productDataModelDoc.ownedByOrganizationId,
      visibility: productDataModelDoc.visibility,
      sections: productDataModelDoc.sections.map((s) => ({
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
    });
  }

  async save(productDataModel: ProductDataModel) {
    const dataModelDoc = await this.productDataModelDoc.findOneAndUpdate(
      { _id: productDataModel.id },
      {
        name: productDataModel.name,
        version: productDataModel.version,
        visibility: productDataModel.visibility,
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

  async findAllAccessibleByOrganization(organization: Organization) {
    const foundDataModelDocs = await this.productDataModelDoc
      .find(
        {
          $or: [
            { ownedByOrganizationId: organization.id },
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
