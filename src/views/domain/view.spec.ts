import { View } from './view';
import { Template } from '../../templates/domain/template';
import {
  LaptopFactory,
  laptopFactory,
} from '../../templates/fixtures/laptop.factory';

describe('view', () => {
  it('creates default view from template draft', () => {
    const laptop = Template.loadFromDb(laptopFactory.addSections().build());
    const view = View.create({
      title: laptop.name,
      template: laptop,
    });
    expect(view.id).toEqual(expect.any(String));
    expect(view.title).toEqual(laptop.name);
    expect(view.createdByUserId).toEqual(laptop.createdByUserId);
    expect(view.isOwnedBy(laptop.ownedByOrganizationId)).toBeTruthy();
    expect(view.templateId).toEqual(laptop.id);
    expect(view.pages.map((p) => ({ id: p.id, title: p.title }))).toEqual([
      { id: expect.any(String), title: 'Home' },
      { id: LaptopFactory.ids.techSpecs.id, title: 'Technical specifications' },
      { id: LaptopFactory.ids.environment.id, title: 'Environment' },
      { id: LaptopFactory.ids.material.id, title: 'Material' },
      { id: LaptopFactory.ids.materialCo2.id, title: 'Material Co2' },
    ]);
  });
});
