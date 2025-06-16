import { z } from 'zod';
import { flatMap, get } from 'lodash';
import { semitrailerAas } from './semitrailer-aas';

export enum AssetAdministrationShellType {
  Truck = 'Truck',
  Semitrailer_Truck = 'Semitrailer_Truck',
}

const AASPropertySchema = z.object({
  idShort: z.string(),
  value: z.ostring(),
  valueType: z.string().default('xs:string'),
  modelType: z.literal('Property'),
});
export type AasProperty = z.infer<typeof AASPropertySchema>;

export const AASPropertyWithParentSchema = z.object({
  parentIdShort: z.string(),
  property: AASPropertySchema,
});

export type AASPropertyWithParent = z.infer<typeof AASPropertyWithParentSchema>;

export class AssetAdministrationShell {
  private constructor(public readonly properties: AASPropertyWithParent[]) {}

  static create(data: { content: any }) {
    const allProperties = AASPropertyWithParentSchema.array().parse(
      flatMap(data.content.submodels, (submodel) =>
        AssetAdministrationShell.collectPropertiesWithParent(
          submodel.submodelElements || [],
          submodel.idShort,
        ),
      ),
    );
    return new AssetAdministrationShell(allProperties);
  }

  private static collectPropertiesWithParent(
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
}

const AssetAdministrationShellData = {
  [AssetAdministrationShellType.Semitrailer_Truck]: semitrailerAas,
};

export function createAasForType(aasType: AssetAdministrationShellType) {
  return AssetAdministrationShell.create({
    content: AssetAdministrationShellData[aasType],
  });
}
