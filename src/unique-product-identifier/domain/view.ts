import { maxBy, minBy } from 'lodash';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { Model } from '../../models/domain/model';
import {
  DataSection,
  isGroupSection,
  isRepeaterSection,
  RepeaterSection,
} from '../../product-data-model/domain/section';
import { Item } from '../../items/domain/item';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { SectionType } from '../../data-modelling/domain/section-base';
import { DataValue } from '../../product-passport/domain/data-value';

export class View {
  private constructor(
    private readonly productDataModel: ProductDataModel,
    private readonly model: Model,
    private readonly item: Item | undefined,
  ) {}

  static create(data: {
    productDataModel: ProductDataModel;
    model: Model;
    item?: Item;
  }) {
    return new View(data.productDataModel, data.model, data.item);
  }

  build() {
    const nodes = [];
    const rootSections = this.productDataModel.sections.filter(
      (s) => s.parentId === undefined,
    );
    const rootSectionsFilteredByLevel = this.item
      ? rootSections // at the item level we show all root sections
      : rootSections.filter(
          (s) =>
            s.granularityLevel === GranularityLevel.MODEL ||
            s.granularityLevel === undefined,
        );
    for (const section of rootSectionsFilteredByLevel) {
      if (isRepeaterSection(section)) {
        nodes.push(this.processRepeaterSection(section));
      } else if (isGroupSection(section)) {
        nodes.push(this.processSection(section));
      }
    }
    return {
      name: this.model.name,
      description: this.model.description,
      nodes: nodes,
    };
  }

  processRepeaterSection(section: RepeaterSection) {
    const dataValuesOfSectionAllRows =
      section.granularityLevel === GranularityLevel.MODEL
        ? this.model.getDataValuesBySectionId(section.id)
        : (this.item?.getDataValuesBySectionId(section.id) ?? []);
    const minRow = minBy(dataValuesOfSectionAllRows, 'row')?.row ?? 0;
    const maxRow = maxBy(dataValuesOfSectionAllRows, 'row')?.row ?? 0;

    const rows = [];
    for (let rowIndex = minRow; rowIndex <= maxRow; rowIndex++) {
      rows.push(this.processSection(section, rowIndex));
    }
    return {
      name: section.name,
      rows,
    };
  }

  processSection(section: DataSection, rowIndex?: number) {
    let dataValuesOfSection: DataValue[];
    if (section.type === SectionType.REPEATABLE) {
      dataValuesOfSection =
        section.granularityLevel === GranularityLevel.MODEL
          ? this.model.getDataValuesBySectionId(section.id, rowIndex)
          : (this.item?.getDataValuesBySectionId(section.id, rowIndex) ?? []);
    } else {
      dataValuesOfSection = this.model
        .getDataValuesBySectionId(section.id, rowIndex)
        .concat(
          this.item?.getDataValuesBySectionId(section.id, rowIndex) ?? [],
        );
    }

    const children = this.processDataFields(section, dataValuesOfSection);
    for (const subSectionId of section.subSections) {
      const subSection =
        this.productDataModel.findSectionByIdOrFail(subSectionId);
      children.push(this.processSection(subSection, rowIndex));
    }

    return {
      name: isGroupSection(section) ? section.name : undefined,
      layout: section.layout,
      children,
    };
  }

  processDataFields(section: DataSection, dataValuesOfSection: DataValue[]) {
    const result = [];
    for (const dataField of section.dataFields) {
      const dataValue = dataValuesOfSection.find(
        (v) => v.dataFieldId === dataField.id,
      );
      // for model view: filter out data fields that are not in the model
      if (this.item || dataField.granularityLevel !== GranularityLevel.ITEM) {
        result.push({
          type: dataField.type,
          name: dataField.name,
          value: dataValue?.value,
          layout: dataField.layout,
        });
      }
    }
    return result;
  }
}
