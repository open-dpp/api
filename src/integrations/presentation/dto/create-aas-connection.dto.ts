import { z } from 'zod/v4';
import { AssetAdministrationShellType } from '../../domain/asset-administration-shell';
import { AasFieldAssignmentSchema } from './aas-connection.dto';

export const CreateAasMappingSchema = z.object({
  aasType: z.enum(AssetAdministrationShellType),
  dataModelId: z.uuid(),
  modelId: z.uuid().nullable(),
  fieldAssignments: AasFieldAssignmentSchema.array(),
});

export type CreateAasConnectionDto = z.infer<typeof CreateAasMappingSchema>;
