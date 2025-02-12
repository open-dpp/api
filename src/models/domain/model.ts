import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { randomUUID } from 'crypto';
import { User } from '../../users/domain/user';
import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { keyBy, keys, map, mergeWith, pick } from 'lodash';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';

export class DataValue {
  @Expose()
  readonly id: string = randomUUID();
  @Expose()
  readonly value: unknown;
  @Expose()
  readonly dataSectionId: string;
  @Expose()
  readonly dataFieldId: string;

  static fromPlain(plain: Partial<DataValue>) {
    return plainToInstance(DataValue, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
}

export class Model {
  @Expose()
  name: string;
  @Expose()
  description: string | undefined;

  @Expose()
  @Type(() => UniqueProductIdentifier)
  readonly uniqueProductIdentifiers: UniqueProductIdentifier[] = [];

  @Expose()
  readonly id: string = randomUUID();
  @Expose({ name: 'productDataModelId' })
  private _productDataModelId: string | undefined = undefined;
  @Expose({ name: 'dataValues' })
  @Type(() => DataValue)
  private _dataValues: DataValue[] = [];

  @Expose()
  owner: string | undefined;
  readonly createdAt: Date | undefined;

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

  static fromPlain(plain: Partial<Model>) {
    return plainToInstance(Model, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  public mergeWithPlain(plain: unknown): Model {
    const existingPlain = this.toPlain();
    const mergedPlain = mergeWith(
      {},
      existingPlain,
      pick(plain, keys(existingPlain)), // Ignore keys which are not defined in by model
      (objValue, srcValue, key) => {
        if (
          key === 'dataValues' &&
          Array.isArray(objValue) &&
          Array.isArray(srcValue)
        ) {
          const map2 = keyBy(srcValue, 'id');
          return map(objValue, (item) => ({
            ...item,
            ...(map2[item.id] ? { value: map2[item.id].value } : {}), // Merge only value if matching IDs
          }));
        }
      },
    );
    return Model.fromPlain(mergedPlain);
  }

  public toPlain() {
    return instanceToPlain(this);
  }
}
