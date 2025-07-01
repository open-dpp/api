import { Item } from './item';
import { randomUUID } from 'crypto';
import { ignoreIds } from '../../../test/utils';
import {
  ProductDataModel,
  ProductDataModelDbProps,
  VisibilityLevel,
} from '../../product-data-model/domain/product.data.model';
import { Model } from '../../models/domain/model';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { DataValue } from '../../product-passport/domain/data-value';
import { GroupSection } from '../../product-data-model/domain/section';
import { Layout } from '../../data-modelling/domain/layout';
import { TextField } from '../../product-data-model/domain/data-field';

describe('Item', () => {
  const organizationId = randomUUID();
  const userId = randomUUID();

  const sectionId1 = randomUUID();
  const dataFieldId1 = randomUUID();

  const laptopModel: ProductDataModelDbProps = {
    id: randomUUID(),
    visibility: VisibilityLevel.PRIVATE,
    name: 'Laptop',
    version: '1.0',
    ownedByOrganizationId: organizationId,
    createdByUserId: userId,
    sections: [
      GroupSection.loadFromDb({
        id: sectionId1,
        name: 'Section name',
        parentId: undefined,
        subSections: [],
        layout: Layout.create({
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 2 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        }),
        dataFields: [
          TextField.loadFromDb({
            id: dataFieldId1,
            name: 'Title',
            options: { min: 2 },
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 2 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.ITEM,
          }),
        ],
      }),
    ],
  };

  it('should create an item and defines model', () => {
    const item = Item.create({ organizationId, userId });
    const model = Model.create({
      name: 'name',
      userId: userId,
      organizationId: organizationId,
    });
    const productDataModel = ProductDataModel.loadFromDb(laptopModel);
    model.assignProductDataModel(productDataModel);

    item.defineModel(model, productDataModel);
    expect(item.id).toBeDefined();
    expect(item.modelId).toEqual(model.id);
    expect(item.ownedByOrganizationId).toEqual(organizationId);
    expect(item.createdByUserId).toEqual(userId);
    expect(item.productDataModelId).toEqual(model.productDataModelId);
    expect(item.uniqueProductIdentifiers).toEqual([]);
    expect(item.dataValues).toEqual([
      DataValue.create({
        dataSectionId: sectionId1,
        dataFieldId: dataFieldId1,
        value: undefined,
        row: 0,
      }),
    ]);
  });

  it('should create unique product identifier on item creation', () => {
    const item = Item.create({ organizationId, userId });
    const uniqueProductIdentifier1 = item.createUniqueProductIdentifier();
    const uniqueProductIdentifier2 = item.createUniqueProductIdentifier();

    expect(item.id).toBeDefined();
    expect(item.uniqueProductIdentifiers).toEqual([
      uniqueProductIdentifier1,
      uniqueProductIdentifier2,
    ]);
    expect(uniqueProductIdentifier1.referenceId).toEqual(item.id);
    expect(uniqueProductIdentifier2.referenceId).toEqual(item.id);
  });

  it('add data values', () => {
    const item = Item.create({ organizationId, userId });
    item.addDataValues([
      DataValue.create({
        dataFieldId: 'fieldId2',
        dataSectionId: 'sid2',
        value: 'value 2',
        row: 0,
      }),
      DataValue.create({
        dataFieldId: 'fieldId3',
        dataSectionId: 'sid2',
        value: 'value 3',
        row: 0,
      }),
      DataValue.create({
        dataFieldId: 'fieldId2',
        dataSectionId: 'sid2',
        value: 'value 4',
        row: 1,
      }),
      DataValue.create({
        dataFieldId: 'fieldId3',
        dataSectionId: 'sid2',
        value: 'value 5',
        row: 1,
      }),
    ]);
    expect(item.dataValues).toEqual(
      ignoreIds([
        DataValue.create({
          dataSectionId: 'sid2',
          dataFieldId: 'fieldId2',
          value: 'value 2',
          row: 0,
        }),
        DataValue.create({
          dataSectionId: 'sid2',
          dataFieldId: 'fieldId3',
          value: 'value 3',
          row: 0,
        }),
        DataValue.create({
          dataSectionId: 'sid2',
          dataFieldId: 'fieldId2',
          value: 'value 4',
          row: 1,
        }),
        DataValue.create({
          dataSectionId: 'sid2',
          dataFieldId: 'fieldId3',
          value: 'value 5',
          row: 1,
        }),
      ]),
    );
  });
});
