import { Template } from '../../templates/domain/template';
import {
  PhoneFactory,
  phoneFactory,
  phoneItemFactory,
  phoneModelFactory,
} from '../fixtures/product-passport.factory';
import { Model } from '../../models/domain/model';
import { Item } from '../../items/domain/item';
import { ProductPassport } from './product-passport';
import { SectionType } from '../../data-modelling/domain/section-base';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';

describe('ProductPassport', () => {
  it('merge template with data', () => {
    const template = Template.loadFromDb(phoneFactory.addSections().build());
    const model = Model.loadFromDb(
      phoneModelFactory.addDataValues().build({ templateId: template.id }),
    );
    const item = Item.loadFromDb(
      phoneItemFactory.addDataValues().build({
        modelId: model.id,
        templateId: template.id,
      }),
    );
    const productPassport = ProductPassport.create({
      uniqueProductIdentifier: item.uniqueProductIdentifiers[0],
      template: template,
      model: model,
      item: item,
    });

    let result = productPassport.getSectionWithData(
      PhoneFactory.ids.section1.id,
    );
    expect(result).toEqual({
      type: SectionType.REPEATABLE,
      id: PhoneFactory.ids.section1.id,
      parentId: undefined,
      name: 'Repeating Section',
      granularityLevel: GranularityLevel.MODEL,
      subSections: [PhoneFactory.ids.section2.id],
      dataFields: [
        {
          type: DataFieldType.TEXT_FIELD,
          id: PhoneFactory.ids.section1.fields.dataField1,
          name: 'Title 1',
          options: { min: 2 },
          granularityLevel: GranularityLevel.MODEL,
        },
        {
          type: DataFieldType.TEXT_FIELD,
          id: PhoneFactory.ids.section1.fields.dataField2,
          name: 'Title 2',
          options: { min: 7 },
          granularityLevel: GranularityLevel.MODEL,
        },
      ],
      dataValues: [
        {
          [PhoneFactory.ids.section1.fields.dataField1]: 'val1,0',
          [PhoneFactory.ids.section1.fields.dataField2]: 'val2,0',
        },
        {
          [PhoneFactory.ids.section1.fields.dataField1]: 'val1,1',
          [PhoneFactory.ids.section1.fields.dataField2]: 'val2,1',
        },
      ],
    });
    result = productPassport.getSectionWithData(PhoneFactory.ids.section2.id);
    expect(result).toEqual({
      id: PhoneFactory.ids.section2.id,
      type: SectionType.GROUP,
      name: 'Group Section',
      parentId: PhoneFactory.ids.section1.id,
      subSections: [],
      granularityLevel: GranularityLevel.MODEL,
      dataFields: [
        {
          type: DataFieldType.TEXT_FIELD,
          id: PhoneFactory.ids.section2.fields.dataField3,
          name: 'Title 3',
          options: { min: 8 },
          granularityLevel: GranularityLevel.MODEL,
        },
        {
          type: DataFieldType.TEXT_FIELD,
          id: PhoneFactory.ids.section2.fields.dataField4,
          name: 'Title 4',
          options: { min: 8 },
          granularityLevel: GranularityLevel.MODEL,
        },
      ],
      dataValues: [
        {
          [PhoneFactory.ids.section2.fields.dataField3]: 'val3,0',
          [PhoneFactory.ids.section2.fields.dataField4]: 'val4,0',
        },
        {
          [PhoneFactory.ids.section2.fields.dataField3]: 'val3,1',
          [PhoneFactory.ids.section2.fields.dataField4]: 'val4,1',
        },
      ],
    });
    result = productPassport.getSectionWithData(PhoneFactory.ids.section3.id);
    expect(result).toEqual({
      type: SectionType.GROUP,
      id: PhoneFactory.ids.section3.id,
      name: 'Group Section 2',
      subSections: [],
      granularityLevel: GranularityLevel.MODEL,
      parentId: undefined,
      dataFields: [
        {
          type: DataFieldType.TEXT_FIELD,
          id: PhoneFactory.ids.section3.fields.dataFieldId5,
          name: 'Title sg21',
          options: { min: 8 },
          granularityLevel: GranularityLevel.MODEL,
        },
        {
          type: DataFieldType.TEXT_FIELD,
          id: PhoneFactory.ids.section3.fields.dataFieldIdForItem5,
          name: 'Title sg21 for item',
          options: { min: 8 },
          granularityLevel: GranularityLevel.ITEM,
        },
      ],
      dataValues: [
        {
          [PhoneFactory.ids.section3.fields.dataFieldId5]: 'val5,0',
          [PhoneFactory.ids.section3.fields.dataFieldIdForItem5]: 'val5,0,item',
        },
      ],
    });
    result = productPassport.getSectionWithData(
      PhoneFactory.ids.sectionForItem1.id,
    );
    expect(result).toEqual({
      type: SectionType.REPEATABLE,
      id: PhoneFactory.ids.sectionForItem1.id,
      parentId: undefined,
      name: 'Repeating Section for item',
      granularityLevel: GranularityLevel.ITEM,
      subSections: [PhoneFactory.ids.sectionForItem2.id],
      dataFields: [
        {
          type: DataFieldType.TEXT_FIELD,
          id: PhoneFactory.ids.sectionForItem1.fields.dataFieldIdForItem1,
          name: 'Title 1 for item',
          options: { min: 7 },
          granularityLevel: GranularityLevel.ITEM,
        },
        {
          type: DataFieldType.TEXT_FIELD,
          id: PhoneFactory.ids.sectionForItem1.fields.dataFieldIdForItem2,
          name: 'Title 2 for item',
          options: { min: 7 },
          granularityLevel: GranularityLevel.ITEM,
        },
      ],
      dataValues: [
        {
          [PhoneFactory.ids.sectionForItem1.fields.dataFieldIdForItem1]:
            'val1,0,item',
          [PhoneFactory.ids.sectionForItem1.fields.dataFieldIdForItem2]:
            'val2,0,item',
        },
        {
          [PhoneFactory.ids.sectionForItem1.fields.dataFieldIdForItem1]:
            'val1,1,item',
          [PhoneFactory.ids.sectionForItem1.fields.dataFieldIdForItem2]:
            'val2,1,item',
        },
      ],
    });
    result = productPassport.getSectionWithData(
      PhoneFactory.ids.sectionForItem2.id,
    );
    expect(result).toEqual({
      type: SectionType.GROUP,
      id: PhoneFactory.ids.sectionForItem2.id,
      name: 'Group Section for item',
      parentId: PhoneFactory.ids.sectionForItem1.id,
      subSections: [],
      granularityLevel: GranularityLevel.ITEM,
      dataFields: [
        {
          type: DataFieldType.TEXT_FIELD,
          id: PhoneFactory.ids.sectionForItem2.fields.dataFieldIdForItem3,
          name: 'Title 3 for item',
          options: { min: 8 },
          granularityLevel: GranularityLevel.ITEM,
        },
        {
          type: DataFieldType.TEXT_FIELD,
          id: PhoneFactory.ids.sectionForItem2.fields.dataFieldIdForItem4,
          name: 'Title 4 for item',
          options: { min: 8 },
          granularityLevel: GranularityLevel.ITEM,
        },
      ],
      dataValues: [
        {
          [PhoneFactory.ids.sectionForItem2.fields.dataFieldIdForItem3]:
            'val3,0,item',
          [PhoneFactory.ids.sectionForItem2.fields.dataFieldIdForItem4]:
            'val4,0,item',
        },
        {
          [PhoneFactory.ids.sectionForItem2.fields.dataFieldIdForItem3]:
            'val3,1,item',
          [PhoneFactory.ids.sectionForItem2.fields.dataFieldIdForItem4]:
            'val4,1,item',
        },
      ],
    });
    expect(productPassport.mergeTemplateWithData()).toEqual({
      id: item.uniqueProductIdentifiers[0].uuid,
      name: model.name,
      description: model.description,
      sections: [
        productPassport.getSectionWithData(PhoneFactory.ids.section1.id),
        productPassport.getSectionWithData(PhoneFactory.ids.section2.id),
        productPassport.getSectionWithData(PhoneFactory.ids.sectionForItem1.id),
        productPassport.getSectionWithData(PhoneFactory.ids.sectionForItem2.id),
        productPassport.getSectionWithData(PhoneFactory.ids.section3.id),
      ],
    });
  });
});
