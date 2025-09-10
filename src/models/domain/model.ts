import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { randomUUID } from 'crypto';
import { ProductPassportData } from '../../product-passport-data/domain/product-passport-data';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { DataValue } from '../../product-passport-data/domain/data-value';
import { Template } from '../../templates/domain/template';

type ModelCreateProps = {
  name: string;
  userId: string;
  organizationId: string;
  description?: string;
  template: Template;
};

export type ModelDbProps = Omit<ModelCreateProps, 'template'> & {
  id: string;
  uniqueProductIdentifiers: UniqueProductIdentifier[];
  templateId: string;
  dataValues: DataValue[];
  description: string | undefined;
  createdAt: Date;
  updatedAt: Date;
};

export class Model extends ProductPassportData {
  granularityLevel = GranularityLevel.MODEL;
  name: string;
  description: string | undefined;

  private constructor(
    id: string,
    name: string,
    ownedByOrganizationId: string,
    createdByUserId: string,
    uniqueProductIdentifiers: UniqueProductIdentifier[] = [],
    templateId: string,
    dataValues: DataValue[],
    description: string | undefined,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(
      id,
      ownedByOrganizationId,
      createdByUserId,
      uniqueProductIdentifiers,
      templateId,
      dataValues,
      createdAt,
      updatedAt,
    );
    this.name = name;
    this.description = description;
  }

  static create(data: ModelCreateProps) {
    const now = new Date(Date.now());
    const model = new Model(
      randomUUID(),
      data.name,
      data.organizationId,
      data.userId,
      [],
      data.template.id,
      [],
      data.description,
      now,
      now,
    );
    model.initializeDataValueFromTemplate(data.template);
    return model;
  }

  static loadFromDb(data: ModelDbProps) {
    return new Model(
      data.id,
      data.name,
      data.organizationId,
      data.userId,
      data.uniqueProductIdentifiers,
      data.templateId,
      data.dataValues,
      data.description,
      data.createdAt,
      data.updatedAt,
    );
  }

  rename(name: string) {
    this.name = name;
  }

  modifyDescription(description: string | undefined) {
    this.description = description;
  }
}
