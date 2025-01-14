import { randomUUID } from 'crypto';

export class Item {
  public model: string;
  constructor(public readonly id: string = randomUUID()) {}

  defineModel(modelId: string) {
    this.model = modelId;
  }
}
