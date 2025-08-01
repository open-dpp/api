import { Factory } from 'fishery';
import { SectionDraftDbProps } from '../domain/section-draft';
import { randomUUID } from 'crypto';
import { SectionType } from '../../data-modelling/domain/section-base';
import { Layout } from '../../data-modelling/domain/layout';
import {
  layoutColStart2,
  sectionLayoutPropsFactory,
} from '../../data-modelling/fixtures/layout.factory';
import { textFieldProps } from './data-field-draft.factory';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';

export const sectionDraftDbPropsFactory = Factory.define<SectionDraftDbProps>(
  () => ({
    id: randomUUID(),
    parentId: undefined,
    type: SectionType.GROUP,
    name: 'Umwelt',
    layout: Layout.create(sectionLayoutPropsFactory.build()),
    dataFields: [],
    subSections: [],
    granularityLevel: GranularityLevel.MODEL,
  }),
);

export const sectionDraftFactoryIds = {
  environment: 'environment',
  measurement: 'measurement',
  material: 'material',
};

export const sectionDraftEnvironment = sectionDraftDbPropsFactory.params({
  id: sectionDraftFactoryIds.environment,
  type: SectionType.GROUP,
  name: 'Umwelt',
  dataFields: [
    textFieldProps.build({ name: 'Title 1' }),
    textFieldProps.build({
      name: 'Title 2',
      layout: Layout.create(layoutColStart2.build()),
    }),
  ],
});

export const sectionDraftMaterial = sectionDraftDbPropsFactory.params({
  id: sectionDraftFactoryIds.material,
  type: SectionType.REPEATABLE,
  name: 'Material',
  dataFields: [
    textFieldProps.build({ name: 'Material Title 1' }),
    textFieldProps.build({
      name: 'Material Title 2',
      layout: Layout.create(layoutColStart2.build()),
    }),
  ],
});

export const sectionDraftMeasurement = sectionDraftDbPropsFactory.params({
  id: sectionDraftFactoryIds.measurement,
  type: SectionType.GROUP,
  name: 'Measurement',
  dataFields: [
    textFieldProps.build({ name: 'Measurement Title 1' }),
    textFieldProps.build({
      name: 'Measurement Title 2',
      layout: Layout.create(layoutColStart2.build()),
    }),
  ],
});
