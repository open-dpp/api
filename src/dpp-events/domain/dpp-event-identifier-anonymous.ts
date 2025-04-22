import { DppEventIdentifierTypes } from './dpp-event-identifier-types.enum';
import { DppEventIdentifier } from './dpp-event-identifier';

export class DppEventIdentifierAnonymous extends DppEventIdentifier {
  type: DppEventIdentifierTypes = DppEventIdentifierTypes.ANONYMOUS;
}
