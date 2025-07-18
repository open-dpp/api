import { Injectable } from '@nestjs/common';
import {
  ProductDataModel,
  VisibilityLevel,
} from '../domain/product.data.model';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDataModelDoc } from './product-data-model.schema';
import {
  deserializeProductDataModel,
  serializeProductDataModel,
} from '../domain/serialization';

@Injectable()
export class ProductDataModelService {
  constructor(
    @InjectModel(ProductDataModelDoc.name)
    private productDataModelDoc: Model<ProductDataModelDoc>,
  ) {}

  convertToDomain(productDataModelDoc: ProductDataModelDoc): ProductDataModel {
    const plain = productDataModelDoc.toObject();
    return deserializeProductDataModel(plain);
  }

  async save(productDataModel: ProductDataModel) {
    const { _id, ...rest } = serializeProductDataModel(productDataModel);
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
