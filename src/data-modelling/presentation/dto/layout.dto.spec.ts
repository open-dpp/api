import { layoutToDto } from './layout.dto';
import { Layout } from '../../domain/layout';

it('should parse layout', () => {
  const input = {
    colStart: { sm: 2 },
    colSpan: { lg: 1, sm: 1 },
    rowStart: { sm: 3 },
    rowSpan: { sm: 3 },
    cols: { sm: 2 },
  };
  const layout = Layout.create(input);
  expect(layoutToDto(layout)).toEqual(input);
});
