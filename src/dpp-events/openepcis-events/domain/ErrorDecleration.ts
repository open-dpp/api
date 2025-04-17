import { Expose } from 'class-transformer';
import { TimeInfo } from './TimeInfo';
import { DeclarationReason } from './enums/DeclerationReasonEnum';

export abstract class ErrorDeclaration {
  @Expose()
  declarationTime: TimeInfo;

  @Expose()
  correctiveIds: any[];

  @Expose()
  extensions: any[];

  @Expose()
  declarationReason: DeclarationReason;
}
