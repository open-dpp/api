import { Factory } from 'fishery';
import { randomUUID } from 'crypto';
import { GranularityLevel } from '@open-dpp/api-client';
import { sectionLayoutPropsFactory } from '../../data-modelling/fixtures/layout.factory';
import { DataSectionDbProps } from '../domain/section';
import { SectionType } from '../../data-modelling/domain/section-base';

export const sectionDbPropsFactory = Factory.define<DataSectionDbProps>(() => ({
  id: randomUUID(),
  type: SectionType.GROUP,
  parentId: undefined,
  name: 'Section',
  granularityLevel: GranularityLevel.MODEL,
  layout: sectionLayoutPropsFactory.build(),
  dataFields: [],
  subSections: [],
}));
