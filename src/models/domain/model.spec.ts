import { Model } from './model';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';

describe('Model', () => {
  it('should create unique product identifiers on model creation', () => {
    const model = new Model(undefined, 'My model', 'This is my model');
    const uniqueModelIdentifier1 = model.createUniqueProductIdentifier();
    const uniqueModelIdentifier2 = model.createUniqueProductIdentifier();

    expect(model.id).toBeDefined();
    expect(model.uniqueProductIdentifiers).toEqual([
      uniqueModelIdentifier1,
      uniqueModelIdentifier2,
    ]);
    expect(uniqueModelIdentifier1.getReference()).toEqual(model.id);
    expect(uniqueModelIdentifier2.getReference()).toEqual(model.id);
  });

  it('should assign owner for model', () => {
    const model = new Model(undefined, 'My model', 'This is my model');
    const user = new User(randomUUID());
    model.assignOwner(user);
    expect(model.owner).toEqual(user.id);
  });
});
