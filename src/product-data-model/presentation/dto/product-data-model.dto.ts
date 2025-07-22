import { z } from 'zod/v4';
import {
  SectionBaseDtoSchema,
  sectionToDto,
} from '../../../data-modelling/presentation/dto/section-base.dto';
import { ProductDataModel } from '../../domain/product.data.model';
import { Sector } from '@open-dpp/api-client';

const ProductDataModelDtoSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  description: z.string(),
  sectors: z.enum(Sector).array(),
  version: z.string().min(1),
  sections: SectionBaseDtoSchema.array(),
  createdByUserId: z.uuid(),
  ownedByOrganizationId: z.uuid(),
  marketplaceResourceId: z.string().nullable(),
});

export type ProductDataModelDto = z.infer<typeof ProductDataModelDtoSchema>;

export function productDataModelToDto(
  productDataModel: ProductDataModel,
): ProductDataModelDto {
  return ProductDataModelDtoSchema.parse({
    id: productDataModel.id,
    name: productDataModel.name,
    description: productDataModel.description,
    sectors: productDataModel.sectors,
    version: productDataModel.version,
    sections: productDataModel.sections.map((section) => sectionToDto(section)),
    createdByUserId: productDataModel.createdByUserId,
    ownedByOrganizationId: productDataModel.ownedByOrganizationId,
    marketplaceResourceId: productDataModel.marketplaceResourceId,
  });
}

export const productDataModelParamDocumentation = {
  name: 'productDataModelId',
  description: 'The id of the product data model.',
  required: true,
  type: 'string',
  format: 'uuid',
};
