import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { randomUUID } from 'crypto';
import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { keyBy, keys, map, mergeWith, pick } from 'lodash';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { Organization } from '../../organizations/domain/organization';
import { User } from '../../users/domain/user';

export class DataValue {
  @Expose()
  readonly id: string = randomUUID();
  @Expose()
  readonly value: unknown;
  @Expose()
  readonly dataSectionId: string;
  @Expose()
  readonly dataFieldId: string;
  @Expose()
  readonly row?: number;

  constructor(
    dataSectionId: string,
    dataFieldId: string,
    value: unknown,
    row?: number,
  ) {
    this.dataSectionId = dataSectionId;
    this.dataFieldId = dataFieldId;
    this.value = value;
    this.row = row;
  }

  static fromPlain(plain: Partial<DataValue>) {
    return plainToInstance(DataValue, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
  toPlain() {
    return instanceToPlain(this);
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

  @Expose({ name: 'ownedByOrganizationId' })
  private _ownedByOrganizationId: string | undefined;

  @Expose({ name: 'createdByUserId' })
  private _createdByUserId: string | undefined;

  readonly createdAt: Date | undefined;

  @Expose({ name: 'productDataModelId' })
  private _productDataModelId: string | undefined = undefined;

  public get productDataModelId() {
    return this._productDataModelId;
  }

  @Expose({ name: 'dataValues' })
  @Type(() => DataValue)
  private _dataValues: DataValue[] = [];

  public get dataValues() {
    return this._dataValues;
  }

  static create(data: {
    name: string;
    user: User;
    organization: Organization;
  }) {
    return Model.fromPlain({
      name: data.name,
      ownedByOrganizationId: data.organization.id,
      createdByUserId: data.user.id,
    });
  }

  static fromPlain<V>(plain: V) {
    return plainToInstance(Model, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  public get createdByUserId() {
    return this._createdByUserId;
  }

  public get ownedByOrganizationId() {
    return this._ownedByOrganizationId;
  }

  public isOwnedBy(organization: Organization) {
    return this._ownedByOrganizationId === organization.id;
  }

  public getDataValuesBySectionId(sectionId: string, row?: number) {
    const allRows = this.dataValues.filter(
      (d) => d.dataSectionId === sectionId,
    );
    return row !== undefined ? allRows.filter((d) => d.row === row) : allRows;
  }

  public addDataValues(dataValues: DataValue[]) {
    for (const dataValue of dataValues) {
      if (
        this.dataValues.find(
          (d) =>
            d.dataFieldId === dataValue.dataFieldId &&
            d.dataSectionId === dataValue.dataSectionId &&
            d.row === dataValue.row,
        )
      ) {
        throw new Error(
          `Data value for section ${dataValue.dataSectionId}, field ${dataValue.dataFieldId}, row ${dataValue.row} already exists`,
        );
      }
    }
    this.dataValues.push(...dataValues);
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
