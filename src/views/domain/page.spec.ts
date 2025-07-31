import { sectionDbPropsFactory } from '../../templates/fixtures/section.factory';
import { GroupSection, RepeaterSection } from '../../templates/domain/section';
import { Page } from './page';
import { GroupBlock, RepeaterBlock } from './block';
import { ignoreIds } from '../../../test/utils';
import { SectionType } from '../../data-modelling/domain/section-base';

it('creates page from sections', () => {
  const section1 = GroupSection.loadFromDb(sectionDbPropsFactory.build());
  const section2 = GroupSection.loadFromDb(sectionDbPropsFactory.build());
  const section3 = RepeaterSection.loadFromDb(
    sectionDbPropsFactory.build({ type: SectionType.REPEATABLE }),
  );

  const page = Page.create({
    title: 'Environment',
    sections: [section1, section2, section3],
  });
  expect(page.blocks).toEqual(
    ignoreIds([
      GroupBlock.create({ sectionId: section1.id }),
      GroupBlock.create({ sectionId: section2.id }),
      RepeaterBlock.create({ sectionId: section3.id }),
    ]),
  );
});
