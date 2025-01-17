import { defineAbility } from '@casl/ability';
import { User } from '../../users/domain/user';
import { Item } from '../../items/domain/item';

export function defineAbilityFor(user: User) {
  return defineAbility((can) => {
    can('create', Item, { owner: user.id });
    can('readAll', Item, { owner: user.id });
  });
}
