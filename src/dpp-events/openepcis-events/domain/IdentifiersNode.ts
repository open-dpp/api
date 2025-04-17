import { Expose } from 'class-transformer';
import { InstanceData } from './InstanceData';
import { IdentifierSyntaxEnum } from './enums/IdentifierSyntaxEnum';
import { IdentifierTypeEnum } from './enums/IdentifierTypeEnum';

export abstract class IdentifiersNode {
  @Expose()
  identifiersId: number;

  @Expose()
  identifierType: IdentifierTypeEnum;

  @Expose()
  instanceType: IdentifierTypeEnum;

  @Expose()
  instanceData: InstanceData;

  @Expose()
  objectIdentifierSyntax: IdentifierSyntaxEnum;
}
