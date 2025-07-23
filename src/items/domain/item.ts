import { randomUUID } from 'crypto';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';

import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { ProductPassport } from '../../product-passport/domain/product-passport';
import { Model } from '../../models/domain/model';
import { Template } from '../../templates/domain/template';
import { ValueError } from '../../exceptions/domain.errors';
import { DataValue } from '../../product-passport/domain/data-value';

export type ItemCreateProps = { organizationId: string; userId: string };
export type ItemDbProps = ItemCreateProps & {
  id: string;
  uniqueProductIdentifiers: UniqueProductIdentifier[];
  modelId: string | undefined;
  templateId: string | undefined;
  dataValues: DataValue[];
};

export class Item extends ProductPassport {
  granularityLevel = GranularityLevel.ITEM;
  private constructor(
    id: string,
    ownedByOrganizationId: string,
    createdByUserId: string,
    uniqueProductIdentifiers: UniqueProductIdentifier[],
    private _modelId: string | undefined,
    templateId: string | undefined,
    dataValues: DataValue[],
  ) {
    super(
      id,
      ownedByOrganizationId,
      createdByUserId,
      uniqueProductIdentifiers,
      templateId,
      dataValues,
    );
  }

  public static create(data: ItemCreateProps) {
    return new Item(
      randomUUID(),
      data.organizationId,
      data.userId,
      [],
      undefined,
      undefined,
      [],
    );
  }

  public static loadFromDb(data: ItemDbProps) {
    return new Item(
      data.id,
      data.organizationId,
      data.userId,
      data.uniqueProductIdentifiers,
      data.modelId,
      data.templateId,
      data.dataValues,
    );
  }

  get modelId() {
    return this._modelId;
  }

  defineModel(model: Model, productDataModel?: Template) {
    if (productDataModel && model.templateId !== productDataModel.id) {
      throw new ValueError('Model and product data model do not match');
    }
    this._modelId = model.id;
    if (productDataModel) {
      this.assignTemplate(productDataModel);
    }
  }
}
