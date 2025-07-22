import { Factory } from 'fishery';
import { ProductDataModelCreateProps } from '../domain/product.data.model';
import { randomUUID } from 'crypto';
import { Sector } from '@open-dpp/api-client';

export const templateCreatePropsFactory =
  Factory.define<ProductDataModelCreateProps>(() => ({
    name: 'Laptop',
    description: 'My Laptop',
    sectors: [Sector.ELECTRONICS],
    organizationId: randomUUID(),
    userId: randomUUID(),
  }));
