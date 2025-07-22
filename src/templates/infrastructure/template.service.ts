import { Injectable } from '@nestjs/common';
import { Template } from '../domain/template';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TemplateDoc } from './template.schema';
import {
  deserializeProductDataModel,
  serializeProductDataModel,
} from '../domain/serialization';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(TemplateDoc.name)
    private productDataModelDoc: Model<TemplateDoc>,
  ) {}

  convertToDomain(productDataModelDoc: TemplateDoc): Template {
    const plain = productDataModelDoc.toObject();
    return deserializeProductDataModel(plain);
  }

  async save(productDataModel: Template) {
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

  async findByMarketplaceResource(
    organizationId: string,
    marketplaceResourceId: string,
  ) {
    const foundDataModelDoc = await this.productDataModelDoc
      .findOne({
        ownedByOrganizationId: organizationId,
        marketplaceResourceId,
      })
      .exec();
    return this.convertToDomain(foundDataModelDoc);
  }

  async findAllByOrganization(organizationId: string) {
    const foundDataModelDocs = await this.productDataModelDoc
      .find(
        {
          $or: [{ ownedByOrganizationId: organizationId }],
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
      throw new NotFoundInDatabaseException(Template.name);
    }
    return this.convertToDomain(productEntity);
  }
}
