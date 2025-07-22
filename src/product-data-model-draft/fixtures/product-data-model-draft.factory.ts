import { randomUUID } from 'crypto';
import { Factory } from 'fishery';
import { Sector } from '@open-dpp/api-client';
import {
  ProductDataModelDraftCreateProps,
  ProductDataModelDraftDbProps,
} from '../domain/product-data-model-draft';
import { CreateProductDataModelDraftDto } from '../presentation/dto/create-product-data-model-draft.dto';
import {
  sectionDraftEnvironment,
  sectionDraftMaterial,
  sectionDraftMeasurement,
} from './section-draft.factory';

export const productDataModelDraftCreatePropsFactory =
  Factory.define<ProductDataModelDraftCreateProps>(() => ({
    name: 'Laptop',
    description: 'My Laptop',
    sectors: [Sector.ELECTRONICS],
    organizationId: randomUUID(),
    userId: randomUUID(),
  }));

export const productDataModelDraftCreateDtoFactory =
  Factory.define<CreateProductDataModelDraftDto>(() => ({
    name: 'Laptop',
    description: 'My Laptop',
    sectors: [Sector.ELECTRONICS],
  }));

export const productDataModelDraftDbFactory =
  Factory.define<ProductDataModelDraftDbProps>(() => ({
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
  }));
