import { z } from 'zod/v4';
import {
  SectionBaseDtoSchema,
  sectionToDto,
} from '../../../data-modelling/presentation/dto/section-base.dto';
import {
  ProductDataModel,
  VisibilityLevel,
} from '../../domain/product.data.model';

const ProductDataModelDtoSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  version: z.string().min(1),
  sections: SectionBaseDtoSchema.array(),
  visibility: z.enum(VisibilityLevel),
  createdByUserId: z.uuid(),
  ownedByOrganizationId: z.uuid(),
});

export type ProductDataModelDto = z.infer<typeof ProductDataModelDtoSchema>;

export function productDataModelToDto(
  productDataModel: ProductDataModel,
): ProductDataModelDto {
  return ProductDataModelDtoSchema.parse({
    id: productDataModel.id,
    name: productDataModel.name,
    version: productDataModel.version,
    visibility: productDataModel.visibility,
    sections: productDataModel.sections.map((section) => sectionToDto(section)),
    createdByUserId: productDataModel.createdByUserId,
    ownedByOrganizationId: productDataModel.ownedByOrganizationId,
  });
}

export const productDataModelParamDocumentation = {
  name: 'productDataModelId',
  description: 'The id of the product data model.',
  required: true,
  type: 'string',
  format: 'uuid',
};
