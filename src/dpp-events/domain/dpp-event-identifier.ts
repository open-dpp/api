import { Expose } from 'class-transformer';

export abstract class DppEventIdentifier {
  @Expose()
  createdByUserId: string;

  @Expose()
  createdByOrganizationId: string;
}
