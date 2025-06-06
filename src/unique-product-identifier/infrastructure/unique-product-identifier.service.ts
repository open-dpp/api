import { Injectable } from '@nestjs/common';
import { UniqueProductIdentifier } from '../domain/unique.product.identifier';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { ModelDocSchemaVersion } from '../../models/infrastructure/model.schema';
import { Model as MongooseModel } from 'mongoose';
import { UniqueProductIdentifierDoc } from './unique-product-identifier.schema';

@Injectable()
export class UniqueProductIdentifierService {
  constructor(
    @InjectModel(UniqueProductIdentifierDoc.name)
    private uniqueProductIdentifierDoc: MongooseModel<UniqueProductIdentifierDoc>,
  ) {}

  convertToDomain(uniqueProductIdentifierDoc: UniqueProductIdentifierDoc) {
    const uniqueProductIdentifier = UniqueProductIdentifier.fromPlain({
      uuid: uniqueProductIdentifierDoc._id,
    });
    uniqueProductIdentifier.linkTo(uniqueProductIdentifierDoc.referenceId);
    return uniqueProductIdentifier;
  }

  async save(uniqueProductIdentifier: UniqueProductIdentifier) {
    return this.convertToDomain(
      await this.uniqueProductIdentifierDoc.findOneAndUpdate(
        { _id: uniqueProductIdentifier.uuid },
        {
          _schemaVersion: ModelDocSchemaVersion.v1_0_0,
          referenceId: uniqueProductIdentifier.referenceId,
        },
        {
          new: true, // Return the updated document
          upsert: true, // Create a new document if none found
          runValidators: true,
        },
      ),
    );
  }

  async findOne(uuid: string) {
    const uniqueProductIdentifierDoc =
      await this.uniqueProductIdentifierDoc.findById(uuid);
    if (!uniqueProductIdentifierDoc) {
      throw new NotFoundInDatabaseException(UniqueProductIdentifier.name);
    }
    return this.convertToDomain(uniqueProductIdentifierDoc);
  }

  async findAllByReferencedId(referenceId: string) {
    const uniqueProductIdentifiers = await this.uniqueProductIdentifierDoc.find(
      { referenceId },
    );
    return uniqueProductIdentifiers.map((permalink) =>
      this.convertToDomain(permalink),
    );
  }
}
