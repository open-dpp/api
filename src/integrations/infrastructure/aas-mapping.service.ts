import { Injectable } from '@nestjs/common';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model as MongooseModel } from 'mongoose';
import {
  AasMappingDoc,
  AasMappingDocSchemaVersion,
} from './aas-mapping.schema';
import { AasFieldMapping, AasMapping } from '../domain/aas-mapping';

@Injectable()
export class AasMappingService {
  constructor(
    @InjectModel(AasMappingDoc.name)
    private aasMappingDoc: MongooseModel<AasMappingDoc>,
  ) {}

  convertToDomain(aasMappingDoc: AasMappingDoc) {
    return AasMapping.loadFromDb({
      id: aasMappingDoc._id,
      dataModelId: aasMappingDoc.dataModelId,
      fieldMappings: aasMappingDoc.fieldMappings.map((fieldMapping) =>
        AasFieldMapping.create({
          sectionId: fieldMapping.sectionId,
          dataFieldId: fieldMapping.dataFieldId,
          idShortParent: fieldMapping.idShortParent,
          idShort: fieldMapping.idShort,
        }),
      ),
    });
  }

  async save(aasMapping: AasMapping) {
    const aasMappingDoc = await this.aasMappingDoc.findOneAndUpdate(
      { _id: aasMapping.id },
      {
        _schemaVersion: AasMappingDocSchemaVersion.v1_0_0,
        dataModelId: aasMapping.dataModelId,
        fieldMappings: aasMapping.fieldMappings.map((fieldMapping) => ({
          dataFieldId: fieldMapping.dataFieldId,
          sectionId: fieldMapping.sectionId,
          idShortParent: fieldMapping.idShortParent,
          idShort: fieldMapping.idShort,
        })),
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if none found
        runValidators: true,
      },
    );

    return this.convertToDomain(aasMappingDoc);
  }

  async findById(id: string) {
    const aasMappingDoc = await this.aasMappingDoc.findById(id);
    if (!aasMappingDoc) {
      throw new NotFoundInDatabaseException(AasMapping.name);
    }
    return this.convertToDomain(aasMappingDoc);
  }
}
