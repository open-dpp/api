import { randomUUID } from 'crypto';
import { Factory } from 'fishery';
import { ProductDataModelDbProps } from '../domain/product.data.model';
import { GranularityLevel, VisibilityLevel } from '@open-dpp/api-client';
import { GroupSection } from '../domain/section';
import { Layout } from '../../data-modelling/domain/layout';
import { TextField } from '../domain/data-field';

export const productDataModelDbPropsFactory =
  Factory.define<ProductDataModelDbProps>(() => ({
    id: randomUUID(),
    name: 'Laptop',
    version: 'v2',
    visibility: VisibilityLevel.PUBLIC,
    ownedByOrganizationId: randomUUID(),
    createdByUserId: randomUUID(),
    sections: [
      GroupSection.loadFromDb({
        id: 's1',
        parentId: undefined,
        name: 'Environment',
        granularityLevel: GranularityLevel.MODEL,
        layout: Layout.create({
          cols: { sm: 3 },
          colStart: { sm: 1 },
          colSpan: { sm: 7 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        }),
        dataFields: [
          TextField.create({
            name: 'Serial number',
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
          TextField.create({
            name: 'Processor',
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
        ],
        subSections: ['s1.1'],
      }),
      GroupSection.loadFromDb({
        id: 's1.1',
        parentId: 's1',
        name: 'CO2',
        granularityLevel: GranularityLevel.MODEL,
        layout: Layout.create({
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 1 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        }),
        dataFields: [
          TextField.create({
            name: 'Consumption',
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
        ],
        subSections: [],
      }),
    ],
  }));
