import { Expose } from 'class-transformer';
import { randomUUID } from 'crypto';
import { DataValue } from '../../models/domain/model';
import { z } from 'zod';
import { flatMap, get } from 'lodash';

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
  @Expose()
  readonly id: string = randomUUID();
  @Expose()
  readonly dataModelId: string;

  @Expose()
  readonly fieldMappings: AasFieldMapping[] = [];

  constructor(dataModelId: string) {
    this.dataModelId = dataModelId;
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
          return new DataValue(
            field.sectionId,
            field.dataFieldId,
            this.parseValue(property),
          );
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
  @Expose()
  readonly dataFieldId: string;
  @Expose()
  readonly sectionId: string;
  @Expose()
  readonly idShortParent: string;
  @Expose()
  readonly idShort: string;

  constructor(
    dataFieldId: string,
    sectionId: string,
    idShortParent: string,
    idShort: string,
  ) {
    this.dataFieldId = dataFieldId;
    this.idShort = idShort;
    this.sectionId = sectionId;
    this.idShortParent = idShortParent;
  }

  toPlain() {
    return this;
  }
}
