import { randomUUID } from 'crypto';
import { Factory } from 'fishery';
import { Sector } from '@open-dpp/api-client';
import {
  TemplateDraftCreateProps,
  TemplateDraftDbProps,
} from '../domain/template-draft';
import { CreateTemplateDraftDto } from '../presentation/dto/create-template-draft.dto';
import {
  sectionDraftEnvironment,
  sectionDraftMaterial,
  sectionDraftMeasurement,
} from './section-draft.factory';

export const templateDraftCreatePropsFactory =
  Factory.define<TemplateDraftCreateProps>(() => ({
    name: 'Laptop',
    description: 'My Laptop',
    sectors: [Sector.ELECTRONICS],
    organizationId: randomUUID(),
    userId: randomUUID(),
  }));

export const templateDraftCreateDtoFactory =
  Factory.define<CreateTemplateDraftDto>(() => ({
    name: 'Laptop',
    description: 'My Laptop',
    sectors: [Sector.ELECTRONICS],
  }));

export const templateDraftDbFactory = Factory.define<TemplateDraftDbProps>(
  () => ({
    id: randomUUID(),
    description: 'My description',
    sectors: [Sector.ELECTRONICS],
    publications: [],
    name: 'Laptop',
    version: '1.0.0',
    organizationId: randomUUID(),
    userId: randomUUID(),
    sections: [
      sectionDraftEnvironment.build(),
      sectionDraftMaterial.build({ id: 'm1', subSections: ['meas1'] }),
      sectionDraftMeasurement.build({ id: 'meas1', parentId: 'm1' }),
    ],
  }),
);
