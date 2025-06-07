import { randomUUID } from 'crypto';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';

import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { DataValue, Passport } from '../../passport/domain/passport';

export class Item extends Passport {
  granularityLevel = GranularityLevel.ITEM;
  private constructor(
    id: string,
    uniqueProductIdentifiers: UniqueProductIdentifier[],
    private _modelId: string | undefined,
    productDataModelId: string | undefined,
    dataValues: DataValue[],
  ) {
    super(id, uniqueProductIdentifiers, productDataModelId, dataValues);
  }

  public static create() {
    return new Item(randomUUID(), [], undefined, undefined, []);
  }

  public static loadFromDb(data: {
    id: string;
    uniqueProductIdentifiers: UniqueProductIdentifier[];
    modelId: string | undefined;
    productDataModelId: string | undefined;
    dataValues: DataValue[];
  }) {
    return new Item(
      data.id,
      data.uniqueProductIdentifiers,
      data.modelId,
      data.productDataModelId,
      data.dataValues,
    );
  }

  get modelId() {
    return this._modelId;
  }

  defineModel(modelId: string) {
    this._modelId = modelId;
  }
}
