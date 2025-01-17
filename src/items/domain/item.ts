import { randomUUID } from 'crypto';

export class Item {
  private _model: string;
  private _owner: string;
  constructor(public readonly id: string = randomUUID()) {}

  get model() {
    return this._model;
  }

  get owner() {
    return this._owner;
  }

  defineModel({
    modelId,
    modelOwner,
  }: {
    modelId: string;
    modelOwner: string;
  }) {
    this._model = modelId;
    this._owner = modelOwner;
  }
}
