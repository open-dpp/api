import { randomUUID } from 'crypto';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';

import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { DataValue, Passport } from '../../passport/passport';

export class Item extends Passport {
  granularityLevel = GranularityLevel.ITEM;
  private _model: string;

  private constructor(
    public readonly id: string,
    public readonly uniqueProductIdentifiers: UniqueProductIdentifier[],
    productDataModelId: string | undefined,
    dataValues: DataValue[],
  ) {
    super(productDataModelId, dataValues);
  }

  public static create() {
    return new Item(randomUUID(), [], undefined, []);
  }

  public static fromPlain(
    id: string,
    uniqueProductIdentifiers: UniqueProductIdentifier[],
    productDataModelId: string | undefined,
    dataValues: DataValue[],
  ) {
    return new Item(
      id,
      uniqueProductIdentifiers,
      productDataModelId,
      dataValues,
    );
  }

  get model() {
    return this._model;
  }

  defineModel(modelId: string) {
    this._model = modelId;
  }

  public createUniqueProductIdentifier() {
    const uniqueProductIdentifier = new UniqueProductIdentifier();
    uniqueProductIdentifier.linkTo(this.id);
    this.uniqueProductIdentifiers.push(uniqueProductIdentifier);
    return uniqueProductIdentifier;
  }
}
