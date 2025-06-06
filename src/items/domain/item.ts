import { randomUUID } from 'crypto';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';

import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { DataValue, Passport } from '../../passport/domain/passport';

export class Item extends Passport {
  granularityLevel = GranularityLevel.ITEM;
  private _modelId: string;

  private constructor(
    public readonly id: string,
    public readonly uniqueProductIdentifiers: UniqueProductIdentifier[],
    modelId: string | undefined,
    productDataModelId: string | undefined,
    dataValues: DataValue[],
  ) {
    super(productDataModelId, dataValues);
    this._modelId = modelId;
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

  public createUniqueProductIdentifier() {
    const uniqueProductIdentifier = new UniqueProductIdentifier();
    uniqueProductIdentifier.linkTo(this.id);
    this.uniqueProductIdentifiers.push(uniqueProductIdentifier);
    return uniqueProductIdentifier;
  }
}
