import { Expose } from 'class-transformer';
import { DppEventIdentifierTypes } from './dpp-event-identifier-types.enum';
import { DppEventIdentifier } from './dpp-event-identifier';

export class DppEventIdentifierUser extends DppEventIdentifier {
  type: DppEventIdentifierTypes = DppEventIdentifierTypes.USER;

  @Expose()
  createdByUserId: string;

  @Expose()
  createdByOrganizationId: string;
}
