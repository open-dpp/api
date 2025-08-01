import { Template } from '../../templates/domain/template';
import { Model } from '../../models/domain/model';
import { Item } from '../../items/domain/item';
import { DataSection } from '../../templates/domain/section';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { maxBy, minBy } from 'lodash';
import { DataValue } from '../../product-passport-data/domain/data-value';
import { SectionType } from '../../data-modelling/domain/section-base';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';

export class ProductPassport {
  private constructor(
    private readonly template: Template,
    private readonly model: Model,
    private readonly item: Item | null,
    private readonly uniqueProductIdentifier: UniqueProductIdentifier,
  ) {}

  static create(data: {
    template: Template;
    model: Model;
    item: Item | null;
    uniqueProductIdentifier: UniqueProductIdentifier;
  }) {
    return new ProductPassport(
      data.template,
      data.model,
      data.item,
      data.uniqueProductIdentifier,
    );
  }

  mergeTemplateWithData() {
    return {
      id: this.uniqueProductIdentifier.uuid,
      name: this.model.name,
      description: this.model.description,
      sections: this.template.sections.map((section) =>
        this.getSectionWithData(section.id),
      ),
    };
  }

  getSectionWithData(sectionId: string) {
    const section = this.template.findSectionByIdOrFail(sectionId);
    const dataValues = this.constructDataValues(section);
    return {
      name: section.name,
      type: section.type,
      id: section.id,
      parentId: section.parentId,
      subSections: section.subSections,
      granularityLevel: section.granularityLevel,
      dataFields: section.dataFields.map((field) => ({
        options: field.options,
        type: field.type,
        id: field.id,
        name: field.name,
        granularityLevel: field.granularityLevel,
      })),
      dataValues,
    };
  }

  constructDataValues(section: DataSection) {
    let dataValuesOfSection: DataValue[];
    if (section.type === SectionType.REPEATABLE) {
      dataValuesOfSection =
        section.granularityLevel === GranularityLevel.MODEL
          ? this.model.getDataValuesBySectionId(section.id)
          : (this.item?.getDataValuesBySectionId(section.id) ?? []);
    } else {
      dataValuesOfSection = this.model
        .getDataValuesBySectionId(section.id)
        .concat(this.item?.getDataValuesBySectionId(section.id) ?? []);
    }

    const minRow = minBy(dataValuesOfSection, 'row')?.row ?? 0;
    const maxRow = maxBy(dataValuesOfSection, 'row')?.row ?? 0;
    const dataValues = [];
    for (let rowIndex = minRow; rowIndex <= maxRow; rowIndex++) {
      dataValues.push(
        this.processDataFields(
          section,
          dataValuesOfSection.filter((v) => v.row === rowIndex),
        ),
      );
    }
    return dataValues;
  }

  processDataFields(section: DataSection, dataValuesOfSection: DataValue[]) {
    const result = {};
    for (const dataField of section.dataFields) {
      const dataValue = dataValuesOfSection.find(
        (v) => v.dataFieldId === dataField.id,
      );
      // for model view: filter out data fields that are not in the model
      if (this.item || dataField.granularityLevel !== GranularityLevel.ITEM) {
        result[dataField.id] = dataValue?.value;
      }
    }
    return result;
  }
}
