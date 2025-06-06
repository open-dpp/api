import { maxBy, minBy } from 'lodash';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { Model } from '../../models/domain/model';
import {
  DataSection,
  isGroupSection,
  isRepeaterSection,
  RepeaterSection,
} from '../../product-data-model/domain/section';
import { DataValue } from '../../passport/domain/passport';

export class View {
  private constructor(
    private readonly productDataModel: ProductDataModel,
    private readonly model: Model,
  ) {}

  static create(data: { productDataModel: ProductDataModel; model: Model }) {
    return new View(data.productDataModel, data.model);
  }

  build() {
    const nodes = [];
    for (const section of this.productDataModel.sections.filter(
      (s) => s.parentId === undefined,
    )) {
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
    const dataValuesOfSectionAllRows = this.model.getDataValuesBySectionId(
      section.id,
    );
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
    const dataValuesOfSection = this.model.getDataValuesBySectionId(
      section.id,
      rowIndex,
    );

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
      result.push({
        type: dataField.type,
        name: dataField.name,
        value: dataValue?.value,
        layout: dataField.layout,
      });
    }
    return result;
  }
}
