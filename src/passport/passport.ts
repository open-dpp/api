import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { ProductDataModel } from '../product-data-model/domain/product.data.model';
import { randomUUID } from 'crypto';

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

  static fromPlain(plain: Partial<DataValue>) {
    return plainToInstance(DataValue, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
}

export abstract class Passport {
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
    this._dataValues = productDataModel.createInitialDataValues();
  }

  public toPlain() {
    return instanceToPlain(this);
  }
}
