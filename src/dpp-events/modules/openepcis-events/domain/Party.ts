import { Expose } from 'class-transformer';
import { GlnTypeEnum } from './enums/GlnTypeEnum';
import { PartyTypeEnum } from './enums/PartyTypeEnum';

export abstract class Party {
  @Expose()
  type: PartyTypeEnum;

  @Expose()
  glnType: GlnTypeEnum;

  @Expose()
  gln: string;

  @Expose()
  extension: number;

  @Expose()
  ID: number;
}
