import { z } from 'zod/v4';
import { SectionType } from '../../domain/section-base';
import { layoutToDto, SectionLayoutDtoSchema } from './layout.dto';
import { GranularityLevel } from '../../domain/granularity-level';
import { DataFieldBaseSchema, dataFieldToDto } from './data-field-base.dto';
import { DataSectionDraft } from '../../../product-data-model-draft/domain/section-draft';
import { DataSection } from '../../../product-data-model/domain/section';

export const SectionBaseDtoSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  type: z.enum(SectionType),
  parentId: z.string().optional(),
  subSections: z.string().array(),
  layout: SectionLayoutDtoSchema,
  dataFields: DataFieldBaseSchema.array(),
  granularityLevel: z.enum(GranularityLevel).optional(),
});

export function sectionToDto(section: DataSection | DataSectionDraft) {
  return SectionBaseDtoSchema.parse({
    id: section.id,
    name: section.name,
    type: section.type,
    dataFields: section.dataFields.map((dataField) =>
      dataFieldToDto(dataField),
    ),
    parentId: section.parentId,
    layout: layoutToDto(section.layout),
    subSections: section.subSections,
    granularityLevel: section.granularityLevel,
  });
}
