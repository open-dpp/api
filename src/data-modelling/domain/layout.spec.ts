import { Layout } from './layout';
import { ValueError } from '../../exceptions/domain.errors';

describe('Layout', () => {
  it('should be created', () => {
    const sectionGrid = Layout.create({
      colStart: { sm: 2 },
      colSpan: { sm: 3 },
      cols: { sm: 3 },
      rowStart: { sm: 5 },
      rowSpan: { sm: 9 },
    });
    expect(sectionGrid.colStart).toEqual({ sm: 2 });
    expect(sectionGrid.colSpan).toEqual({ sm: 3 });
    expect(sectionGrid.cols).toEqual({ sm: 3 });
    expect(sectionGrid.rowStart).toEqual({ sm: 5 });
    expect(sectionGrid.rowSpan).toEqual({ sm: 9 });
  });

  it.each([2.2, 13, -1])(
    'should throw error for not supported cols',
    (cols) => {
      expect(() =>
        Layout.create({
          colStart: { sm: cols },
          colSpan: { sm: cols },
          rowStart: { sm: cols },
          rowSpan: { sm: cols },
          cols: { sm: cols },
        }),
      ).toThrow(ValueError);
    },
  );

  it('should modify col and row config', () => {
    const layout = Layout.create({
      colStart: { sm: 2 },
      colSpan: { sm: 3 },
      rowStart: { sm: 3 },
      rowSpan: { sm: 3 },
      cols: { sm: 3 },
    });
    const modifications = {
      colStart: { sm: 7, xs: 2 },
      colSpan: { sm: 7, lg: 3 },
      rowSpan: { sm: 1 },
      rowStart: { sm: 3 },
      cols: { sm: 6, md: 10 },
    };
    layout.modify(modifications);

    expect(layout).toEqual(
      Layout.create({
        colStart: modifications.colStart ?? layout.colStart,
        colSpan: modifications.colSpan ?? layout.colSpan,
        rowStart: modifications.rowStart ?? layout.rowStart,
        rowSpan: modifications.rowSpan ?? layout.rowSpan,
        cols: modifications.cols ?? layout.cols,
      }),
    );

    // if no value is provided the current defined should be used
    layout.modify({});
    expect(layout).toEqual(layout);
  });
});
