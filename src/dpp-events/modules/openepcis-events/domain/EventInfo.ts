import { Expose } from 'class-transformer';
import { BizTransaction } from './BizTransaction';
import { ErrorDeclaration } from './ErrorDecleration';
import { ReadPoint } from './ReadPoint';
import { TimeInfo } from './TimeInfo';
import { Party } from './Party';
import { IdentifierSyntaxEnum } from './enums/IdentifierSyntaxEnum';
import { EventTypeEnum } from './enums/EventTypeEnum';
import { RecordTimeOptionEnum } from './enums/RecordTimeOptionEnum';
import { BusinessStepEnum } from './enums/BusinessStepEnum';
import { DispositionEnum } from './enums/DispositionEnum';
import { ActionEnum } from './enums/ActionEnum';

export abstract class EventInfo {
  @Expose()
  objectIdentifierSyntax: IdentifierSyntaxEnum;

  @Expose()
  locationPartyIdentifierSyntax: IdentifierSyntaxEnum;

  @Expose()
  dlURL: string;

  @Expose()
  eventCount: number;

  @Expose()
  eventTime: TimeInfo;

  @Expose()
  parentIdentifier: any[];

  @Expose()
  instanceIdentifier: any[];

  @Expose()
  classIdentifier: any[];

  @Expose()
  outputInstanceIdentifier: any[];

  @Expose()
  outputClassIdentifier: any[];

  @Expose()
  readPoint: ReadPoint;

  @Expose()
  bizLocation: Record<string, any>;

  @Expose()
  persistentDispositionList: any[];

  @Expose()
  bizTransactions: BizTransaction[];

  @Expose()
  sources: Party[];

  @Expose()
  destinations: Party[];

  @Expose()
  sensorElementList: any[];

  @Expose()
  userExtensions: any[];

  @Expose()
  ilmd: any[];

  @Expose()
  errorDeclaration: ErrorDeclaration;

  @Expose()
  eventType: EventTypeEnum;

  @Expose()
  ordinaryEvent: boolean;

  @Expose()
  eventID: boolean;
  recordTimeOption: RecordTimeOptionEnum;

  @Expose()
  businessStep: BusinessStepEnum;

  @Expose()
  disposition: DispositionEnum;

  @Expose()
  action: ActionEnum;

  @Expose()
  referencedIdentifier: any[];

  @Expose()
  parentReferencedIdentifier: Record<string, any>;

  @Expose()
  outputReferencedIdentifier: any[];

  @Expose()
  name: string;

  @Expose()
  description: string;
}
