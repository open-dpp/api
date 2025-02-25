import { Expose, plainToInstance } from 'class-transformer';
import { groupBy } from 'lodash';
import {
  DataField,
  DataType,
  ProductDataModel,
  SectionType,
} from '../../product-data-model/domain/product.data.model';
import { DataValue, Model } from '../../models/domain/model';

type RowView = {
  fields: { type: DataType; value: unknown; name: string }[];
};

type SectionView = {
  name: string;
  rows: RowView[];
};

export class View {
  @Expose()
  readonly productDataModel: ProductDataModel;

  @Expose()
  readonly model: Model;

  static fromPlain(plain: Partial<View>) {
    return plainToInstance(View, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  buildFields(dataValues: DataValue[], dataFields: DataField[]) {
    return dataFields.map((f) => {
      const foundDataValue = dataValues.find((d) => d.dataFieldId === f.id);
      return {
        type: f.type,
        name: f.name,
        value: foundDataValue.value,
      };
    });
  }

  build(): { name: string; sections: SectionView[] } {
    const sectionsOutput: SectionView[] = [];
    for (const section of this.productDataModel.sections) {
      const dataValuesOfSection = this.model.dataValues.filter(
        (d) => d.dataSectionId === section.id,
      );
      if (section.type === SectionType.GROUP) {
        sectionsOutput.push({
          name: section.name,
          rows: [
            {
              fields: this.buildFields(dataValuesOfSection, section.dataFields),
            },
          ],
        });
      } else {
        const rows: RowView[] = [];
        const dataValuesByRow = groupBy(dataValuesOfSection, 'row');
        for (const [, dataValues] of Object.entries(dataValuesByRow)) {
          rows.push({
            fields: this.buildFields(dataValues, section.dataFields),
          });
        }
        sectionsOutput.push({
          name: section.name,
          rows,
        });
      }
    }
    return {
      name: this.model.name,
      sections: sectionsOutput,
    };
  }
}
