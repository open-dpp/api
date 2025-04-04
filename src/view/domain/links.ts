import { Expose, plainToInstance } from 'class-transformer';
import { Page } from './page';
import { Block, BlockType } from './block';

export class FieldReference extends Block {
  @Expose()
  readonly fieldId: string;

  static create(data: { fieldId: string }) {
    return plainToInstance(
      FieldReference,
      { ...data, type: BlockType.FIELD_REFERENCE },
      {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      },
    );
  }
}

export class PageLink extends Block {
  @Expose()
  readonly pageId: string;

  static create(data: { page: Page }) {
    return plainToInstance(
      PageLink,
      { pageId: data.page._id, type: BlockType.PAGE_LINK },
      {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      },
    );
  }
}
