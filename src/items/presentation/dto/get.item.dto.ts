import { ValidateNested } from 'class-validator';

class GetUniqueProductIdentifier {
  uuid: string;
  view: string;
  referenceId: string;
}

export class GetItemDto {
  id: string;
  @ValidateNested()
  uniqueProductIdentifiers: GetUniqueProductIdentifier[];
}
