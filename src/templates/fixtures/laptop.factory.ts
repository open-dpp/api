import { dataFieldDbPropsFactory } from './data-field.factory';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';
import { GranularityLevel, Sector } from '@open-dpp/api-client';
import { SectionType } from '../../data-modelling/domain/section-base';
import {
  layoutColStart2,
  layoutColStart3,
  layoutPropsFactory,
} from '../../data-modelling/fixtures/layout.factory';
import { sectionDbPropsFactory } from './section.factory';
import { Factory } from 'fishery';
import { TemplateDbProps } from '../domain/template';
import { randomUUID } from 'crypto';

export class LaptopFactory extends Factory<TemplateDbProps> {
  static ids = {
    techSpecs: {
      id: randomUUID(),
      fields: {
        processor: randomUUID(),
        memory: randomUUID(),
        serialNumber: randomUUID(),
        batteryStatus: randomUUID(),
      },
    },
    environment: {
      id: randomUUID(),
      fields: {
        waterConsumption: randomUUID(),
        energyConsumption: randomUUID(),
      },
    },
    material: {
      id: randomUUID(),
      fields: {
        materialType: randomUUID(),
        mass: randomUUID(),
      },
    },
    materialCo2: {
      id: randomUUID(),
      fields: {
        co2CalculationMethod: randomUUID(),
        co2Emissions: randomUUID(),
      },
    },
  };

  techSpecsSection() {
    return sectionDbPropsFactory.params({
      id: LaptopFactory.ids.techSpecs.id,
      name: 'Technical specifications',
      dataFields: [
        dataFieldDbPropsFactory.build({
          id: LaptopFactory.ids.techSpecs.fields.processor,
          name: 'Processor',
        }),
        dataFieldDbPropsFactory.build({
          id: LaptopFactory.ids.techSpecs.fields.memory,
          name: 'Memory',
          layout: layoutColStart2.build(),
        }),
        dataFieldDbPropsFactory.build({
          id: LaptopFactory.ids.techSpecs.fields.serialNumber,
          name: 'Serial number',
          granularityLevel: GranularityLevel.ITEM,
          layout: layoutColStart3.build(),
        }),
        dataFieldDbPropsFactory.build({
          id: LaptopFactory.ids.techSpecs.fields.batteryStatus,
          name: 'Battery Status',
          granularityLevel: GranularityLevel.ITEM,
          layout: layoutPropsFactory.build({ rowStart: { sm: 2 } }),
        }),
      ],
    });
  }

  materialSection() {
    return sectionDbPropsFactory.params({
      id: LaptopFactory.ids.material.id,
      type: SectionType.REPEATABLE,
      name: 'Material',
      dataFields: [
        dataFieldDbPropsFactory.build({
          id: LaptopFactory.ids.material.fields.materialType,
          name: 'Material type',
        }),
        dataFieldDbPropsFactory.build({
          id: LaptopFactory.ids.material.fields.mass,
          type: DataFieldType.NUMERIC_FIELD,
          name: 'Mass',
          layout: layoutColStart2.build(),
        }),
      ],
    });
  }

  materialCo2Section() {
    return sectionDbPropsFactory.params({
      id: LaptopFactory.ids.materialCo2.id,
      name: 'Material Co2',
      dataFields: [
        dataFieldDbPropsFactory.build({
          id: LaptopFactory.ids.materialCo2.fields.co2CalculationMethod,
          name: 'Co2 calculation method',
        }),
        dataFieldDbPropsFactory.build({
          id: LaptopFactory.ids.materialCo2.fields.co2Emissions,
          type: DataFieldType.NUMERIC_FIELD,
          name: 'Co2 emissions',
          layout: layoutColStart2.build(),
        }),
      ],
    });
  }

  environmentSection() {
    return sectionDbPropsFactory.params({
      id: LaptopFactory.ids.environment.id,
      name: 'Environment',
      dataFields: [
        dataFieldDbPropsFactory.build({
          id: LaptopFactory.ids.environment.fields.waterConsumption,
          name: 'Water consumption',
          type: DataFieldType.NUMERIC_FIELD,
        }),
        dataFieldDbPropsFactory.build({
          id: LaptopFactory.ids.environment.fields.energyConsumption,
          name: 'Energy consumption',
          type: DataFieldType.NUMERIC_FIELD,
          granularityLevel: GranularityLevel.ITEM,
        }),
      ],
    });
  }

  addSections() {
    return this.params({
      sections: [
        this.techSpecsSection().build(),
        this.environmentSection().build(),
        this.materialSection().build({
          subSections: [LaptopFactory.ids.materialCo2.id],
        }),
        this.materialCo2Section().build({
          parentId: LaptopFactory.ids.material.id,
        }),
      ],
    });
  }
}

export const laptopFactory = LaptopFactory.define(() => ({
  id: randomUUID(),
  name: 'Laptop',
  description: 'My Laptop',
  sectors: [Sector.ELECTRONICS],
  version: 'v2',
  organizationId: randomUUID(),
  userId: randomUUID(),
  sections: [],
  marketplaceResourceId: randomUUID(),
}));
