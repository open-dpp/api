import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { Permalink } from '../../permalinks/entities/permalink.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @ManyToMany(() => Organization, (organization) => organization.users, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'organization_user',
    joinColumns: [{ name: 'user_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [
      { name: 'organization_id', referencedColumnName: 'id' },
    ],
  })
  organizations: Organization[];

  @OneToMany(() => Permalink, (permalink) => permalink.product)
  products: Product[];
}

export function makeUser(id: string) {
  const user = new User();
  user.id = id;
  return user;
}
