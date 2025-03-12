import {
  Column,
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
import { ProductDataModelDraftEntity } from '../../product-data-model-draft/infrastructure/product.data.model.draft.entity';
import { ProductDataModelEntity } from '../../product-data-model/infrastructure/product.data.model.entity';

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

  @Column()
  email: string;

  @ManyToMany(
    () => OrganizationEntity,
    (organization) => organization.members,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinTable({
    name: 'organization_user',
    joinColumns: [{ name: 'user_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [
      { name: 'organization_id', referencedColumnName: 'id' },
    ],
  })
  organizations: OrganizationEntity[];

  @OneToMany(() => ModelEntity, (model) => model.createdByUser)
  createdModels: ModelEntity[];

  @OneToMany(() => ProductDataModelDraftEntity, (draft) => draft.createdByUser)
  createdProductModelDrafts: ProductDataModelDraftEntity[];

  @OneToMany(
    () => ProductDataModelEntity,
    (dataModel) => dataModel.createdByUser,
  )
  createdProductModels: ProductDataModelEntity[];

  @OneToMany(() => OrganizationEntity, (org) => org.createdByUserId)
  creatorOfOrganizations: OrganizationEntity[];

  @OneToMany(() => OrganizationEntity, (org) => org.ownedByUserId)
  ownerOfOrganizations: OrganizationEntity[];
}
