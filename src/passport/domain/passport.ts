import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { randomUUID } from 'crypto';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { Organization } from '../../organizations/domain/organization';

export class DataValue {
  private constructor(
    public readonly id: string,
    public readonly value: unknown,
    public readonly dataSectionId: string,
    public readonly dataFieldId: string,
    public readonly row?: number,
  ) {}

  static create(data: {
    value: unknown;
    dataSectionId: string;
    dataFieldId: string;
    row?: number;
  }) {
    return new DataValue(
      randomUUID(),
      data.value,
      data.dataSectionId,
      data.dataFieldId,
      data.row,
    );
  }
}

export abstract class Passport {
  abstract granularityLevel: GranularityLevel;

  protected constructor(
    public readonly id: string,
    private _ownedByOrganizationId: string,
    private _createdByUserId: string,
    public readonly uniqueProductIdentifiers: UniqueProductIdentifier[] = [],
    private _productDataModelId: string | undefined = undefined,
    private _dataValues: DataValue[] = [],
  ) {}

  public get createdByUserId() {
    return this._createdByUserId;
  }

  public get ownedByOrganizationId() {
    return this._ownedByOrganizationId;
  }

  public isOwnedBy(organization: Organization) {
    return this._ownedByOrganizationId === organization.id;
  }

  public get productDataModelId() {
    return this._productDataModelId;
  }

  public get dataValues() {
    return this._dataValues;
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

  public modifyDataValues(dataValues: { id: string; value: unknown }[]) {
    this._dataValues = this.dataValues.map((existingDataValue) => {
      const incomingDataValue = dataValues.find(
        (dataValue) => dataValue.id === existingDataValue.id,
      );
      if (incomingDataValue) {
        return { ...existingDataValue, value: incomingDataValue.value };
      }
      return existingDataValue;
    });
  }

  public assignProductDataModel(productDataModel: ProductDataModel) {
    if (this.productDataModelId !== undefined) {
      throw Error('This model is already connected to a product data model');
    }
    this._productDataModelId = productDataModel.id;
    this._dataValues = productDataModel.createInitialDataValues(
      this.granularityLevel,
    );
  }

  public createUniqueProductIdentifier() {
    const uniqueProductIdentifier = new UniqueProductIdentifier();
    uniqueProductIdentifier.linkTo(this.id);
    this.uniqueProductIdentifiers.push(uniqueProductIdentifier);
    return uniqueProductIdentifier;
  }
}
