import { randomUUID } from 'crypto';

export class Item {
  private _model: string;
  constructor(public readonly id: string = randomUUID()) {}

  get model() {
    return this._model;
  }

  defineModel(modelId: string) {
    this._model = modelId;
  }
}
