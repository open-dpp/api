import { randomUUID } from 'crypto';

import { z } from 'zod';
import { flatMap, get } from 'lodash';
import { DataValue } from '../../passport/domain/passport';

const AASPropertySchema = z.object({
  idShort: z.string(),
  value: z.ostring(),
  valueType: z.string().default('xs:string'),
  modelType: z.literal('Property'),
});

type AasProperty = z.infer<typeof AASPropertySchema>;

const AASPropertyWithParentSchema = z.object({
  parentIdShort: z.string(),
  property: AASPropertySchema,
});

export class AasMapping {
  private constructor(
    public readonly id: string,
    public readonly dataModelId: string,
    public readonly fieldMappings: AasFieldMapping[],
  ) {}

  static create(data: { dataModelId: string }) {
    return new AasMapping(randomUUID(), data.dataModelId, []);
  }

  static loadFromDb(data: {
    id: string;
    dataModelId: string;
    fieldMappings: AasFieldMapping[];
  }) {
    return new AasMapping(data.id, data.dataModelId, data.fieldMappings);
  }

  generateDataValues(aasData: any) {
    const allProperties = AASPropertyWithParentSchema.array().parse(
      flatMap(aasData.submodels, (submodel) =>
        this.collectPropertiesWithParent(
          submodel.submodelElements || [],
          submodel.idShort,
        ),
      ),
    );

    return allProperties
      .map(({ parentIdShort, property }) => {
        const field = this.fieldMappings.find(
          (fieldMapping) =>
            fieldMapping.idShort === property.idShort &&
            fieldMapping.idShortParent === parentIdShort,
        );
        if (field) {
          return DataValue.create({
            dataSectionId: field.sectionId,
            dataFieldId: field.dataFieldId,
            value: this.parseValue(property),
            row: 0, // TODO: Replace hard coded row id
          });
        }
        return undefined;
      })
      .filter((value) => value !== undefined);
  }

  private collectPropertiesWithParent(
    elements: any[],
    parentIdShort: string | null = null,
  ): { parentIdShort: string | null; property: AasProperty }[] {
    return flatMap(elements, (el) => {
      const isProperty = get(el, 'modelType') === 'Property';
      const nested = el.value
        ? this.collectPropertiesWithParent(el.value, el.idShort || null)
        : [];

      return isProperty ? [{ parentIdShort, property: el }, ...nested] : nested;
    });
  }

  private parseValue(property: AasProperty) {
    switch (property.valueType) {
      case 'xs:double':
        return z.number().parse(Number(property.value));
      default:
        return property.value;
    }
  }

  addFieldMapping(fieldMapping: AasFieldMapping) {
    this.fieldMappings.push(fieldMapping);
  }
}

export class AasFieldMapping {
  private constructor(
    public readonly dataFieldId: string,
    public readonly sectionId: string,
    public readonly idShortParent: string,
    public readonly idShort: string,
  ) {}

  public static create(data: {
    dataFieldId: string;
    sectionId: string;
    idShortParent: string;
    idShort: string;
  }) {
    return new AasFieldMapping(
      data.dataFieldId,
      data.sectionId,
      data.idShortParent,
      data.idShort,
    );
  }
}
