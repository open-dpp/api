import { Factory } from 'fishery';
import { LayoutProps } from '../domain/layout';

export const layoutPropsFactory = Factory.define<LayoutProps>(() => ({
  colStart: { sm: 1 },
  colSpan: { sm: 1 },
  rowSpan: { sm: 1 },
  rowStart: { sm: 1 },
}));

export const layoutColStart2 = layoutPropsFactory.params({
  colStart: { sm: 2 },
});

export const layoutColStart3 = layoutPropsFactory.params({
  colStart: { sm: 3 },
});

export const sectionLayoutPropsFactory = layoutPropsFactory.params({
  cols: { sm: 3 },
});
