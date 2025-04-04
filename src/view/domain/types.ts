import { Grid } from './grid';
import { FieldReference, PageLink } from './links';
import { BlockType } from './block';

export const blockSubtypes = [
  { value: Grid, name: BlockType.GRID },
  { value: PageLink, name: BlockType.PAGE_LINK },
  { value: FieldReference, name: BlockType.FIELD_REFERENCE },
];
