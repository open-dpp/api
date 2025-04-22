import { Expose } from 'class-transformer';
import { DppEventIdentifierTypes } from './dpp-event-identifier-types.enum';

export abstract class DppEventIdentifier {
  @Expose()
  type: DppEventIdentifierTypes;
}
