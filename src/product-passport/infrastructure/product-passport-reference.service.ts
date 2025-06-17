import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ProductPassportReferenceDoc,
  ProductPassportReferenceDocSchemaVersion,
} from './product-passport-reference.schema';
import { ProductPassportReference } from '../domain/product-passport-reference';

@Injectable()
export class ProductPassportReferenceService {
  constructor(
    @InjectModel(ProductPassportReferenceDoc.name)
    private productPassportReferenceDoc: Model<ProductPassportReferenceDoc>,
  ) {}

  convertToDomain(productPassportReferenceDoc: ProductPassportReferenceDoc) {
    return ProductPassportReference.loadFromDb({
      id: productPassportReferenceDoc._id,
      referenceId: productPassportReferenceDoc.referenceId,
      passportId: productPassportReferenceDoc.passportId,
      organizationId: productPassportReferenceDoc.ownedByOrganizationId,
      granularityLevel: productPassportReferenceDoc.granularityLevel,
    });
  }

  async save(productPassportReference: ProductPassportReference) {
    const productPassportReferenceDoc =
      await this.productPassportReferenceDoc.findOneAndUpdate(
        { _id: productPassportReference.id },
        {
          referenceId: productPassportReference.referenceId,
          passportId: productPassportReference.passportId,
          _schemaVersion: ProductPassportReferenceDocSchemaVersion.v1_0_0,
          ownedByOrganizationId: productPassportReference.ownedByOrganizationId,
          granularityLevel: productPassportReference.granularityLevel,
        },
        {
          new: true, // Return the updated document
          upsert: true, // Create a new document if none found
          runValidators: true,
        },
      );

    return this.convertToDomain(productPassportReferenceDoc);
  }

  async findOne(organizationId: string, referenceId: string) {
    const foundPassportReferenceDoc = await this.productPassportReferenceDoc
      .findOne({
        ownedByOrganizationId: organizationId,
        referenceId: referenceId,
      })
      .exec();
    return foundPassportReferenceDoc
      ? this.convertToDomain(foundPassportReferenceDoc)
      : undefined;
  }
}
