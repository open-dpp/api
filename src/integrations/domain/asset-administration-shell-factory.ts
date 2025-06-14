import { semitrailerAas } from './semitrailer-aas';
import {
  AssetAdministrationShell,
  AssetAdministrationShellType,
} from './asset-administration-shell';

const AssetAdministrationShellData = {
  [AssetAdministrationShellType.Semitrailer_Truck]: semitrailerAas,
};
export class AssetAdministrationShellFactory {
  static createAasForType(aasType: AssetAdministrationShellType) {
    return AssetAdministrationShell.create({
      content: AssetAdministrationShellData[aasType],
    });
  }
}
