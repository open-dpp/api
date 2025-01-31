import { randomUUID } from 'crypto';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';

export class Item {
  private _model: string;
  constructor(
    public readonly id: string = randomUUID(),
    public readonly uniqueProductIdentifiers: UniqueProductIdentifier[] = [],
  ) {}

  get model() {
    return this._model;
  }

  defineModel(modelId: string) {
    this._model = modelId;
  }

  public createUniqueProductIdentifier() {
    const uniqueProductIdentifier = new UniqueProductIdentifier();
    uniqueProductIdentifier.linkTo(this.id);
    this.uniqueProductIdentifiers.push(uniqueProductIdentifier);
    return uniqueProductIdentifier;
  }
}
