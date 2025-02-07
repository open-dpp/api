import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { randomUUID } from 'crypto';
import { User } from '../../users/domain/user';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';

export class DataValue {
  constructor(
    public readonly id: string = randomUUID(),
    public readonly value: unknown,
    public readonly dataSectionId: string,
    public readonly dataFieldId: string,
  ) {}
}

export class Model {
  constructor(
    public readonly id: string = randomUUID(),
    public name: string,
    public description: string,
    public readonly uniqueProductIdentifiers: UniqueProductIdentifier[] = [],
    private _productDataModelId: string | undefined = undefined,
    private _dataValues: DataValue[] = [],
    public owner?: string,
    public readonly createdAt?: Date,
  ) {}

  public get dataValues() {
    return this._dataValues;
  }

  public get productDataModelId() {
    return this._productDataModelId;
  }

  public isOwnedBy(user: User) {
    return this.owner === user.id;
  }

  public assignOwner(user: User) {
    this.owner = user.id;
  }

  public assignProductDataModel(productDataModel: ProductDataModel) {
    if (this.productDataModelId !== undefined) {
      throw Error('This model is already connected to a product data model');
    }
    this._productDataModelId = productDataModel.id;
    this._dataValues = productDataModel.createInitialDataValues();
  }

  public createUniqueProductIdentifier() {
    const uniqueProductIdentifier = new UniqueProductIdentifier();
    uniqueProductIdentifier.linkTo(this.id);
    this.uniqueProductIdentifiers.push(uniqueProductIdentifier);
    return uniqueProductIdentifier;
  }
}
