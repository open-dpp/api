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
import { OrganizationEntity } from '../../organizations/infrastructure/organization.entity';
import { ModelEntity } from '../../models/infrastructure/model.entity';

@Entity('user')
export class UserEntity {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @ManyToMany(() => OrganizationEntity, (organization) => organization.users, {
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
  organizations: OrganizationEntity[];

  @OneToMany(() => ModelEntity, (product) => product)
  models: ModelEntity[];
}
