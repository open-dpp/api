import { z } from 'zod/v4';
import {
  SectionBaseDtoSchema,
  sectionToDto,
} from '../../../data-modelling/presentation/dto/section-base.dto';
import { ProductDataModelDraft } from '../../domain/product-data-model-draft';

const PublicationDtoSchema = z.object({
  id: z.string(),
  version: z.string(),
});

const ProductDataModelDraftDtoSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  version: z.string().min(1),
  publications: PublicationDtoSchema.array(),
  sections: SectionBaseDtoSchema.array(),
  createdByUserId: z.uuid(),
  ownedByOrganizationId: z.uuid(),
});

export type ProductDataModelDraftDto = z.infer<
  typeof ProductDataModelDraftDtoSchema
>;

export function productDataModelDraftToDto(
  productDataModelDraft: ProductDataModelDraft,
): ProductDataModelDraftDto {
  return ProductDataModelDraftDtoSchema.parse({
    id: productDataModelDraft.id,
    name: productDataModelDraft.name,
    version: productDataModelDraft.version,
    publications: productDataModelDraft.publications.map((publication) =>
      PublicationDtoSchema.parse({
        id: publication.id,
        version: publication.version,
      }),
    ),
    sections: productDataModelDraft.sections.map((section) =>
      sectionToDto(section),
    ),
    createdByUserId: productDataModelDraft.createdByUserId,
    ownedByOrganizationId: productDataModelDraft.ownedByOrganizationId,
  });
}
