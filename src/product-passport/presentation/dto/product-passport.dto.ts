import { z } from 'zod/v4';
import { SectionType } from '../../../data-modelling/domain/section-base';
import { GranularityLevel } from '../../../data-modelling/domain/granularity-level';
import { DataFieldBaseSchema } from '../../../data-modelling/presentation/dto/data-field-base.dto';
import { ProductPassport } from '../../domain/product-passport';
import { sectionToDto } from '../../../data-modelling/presentation/dto/section-base.dto';

const DataSectionDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(SectionType),
  parentId: z.string().optional(),
  subSections: z.array(z.string()),
  granularityLevel: z.enum(GranularityLevel),
  dataFields: DataFieldBaseSchema.omit({ layout: true }).array(),
  dataValues: z.record(z.string(), z.unknown()).array(),
});

const ProductPassportDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  dataSections: DataSectionDtoSchema.array(),
});

export type ProductPassportDto = z.infer<typeof ProductPassportDtoSchema>;

export function productPassportToDto(
  productPassport: ProductPassport,
): ProductPassportDto {
  return ProductPassportDtoSchema.parse({
    id: productPassport.id,
    name: productPassport.name,
    description: productPassport.description,
    dataSections: productPassport.dataSections.map((dataSection) => ({
      ...sectionToDto(dataSection),
      dataValues: dataSection.dataValues,
    })),
  });
}
