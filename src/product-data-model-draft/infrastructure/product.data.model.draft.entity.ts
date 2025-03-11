import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  RelationId,
} from 'typeorm';
import { DataSectionDraftEntity } from './data.section.draft.entity';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { OrganizationEntity } from '../../organizations/infrastructure/organization.entity';
import { Publication } from '../domain/product.data.model.draft';

@Entity('product_data_model_draft')
export class ProductDataModelDraftEntity {
  @PrimaryColumn('uuid', { name: 'id' })
  id: string;
  @Column()
  name: string;
  @Column()
  version: string;

  @Column('simple-json')
  publications: Publication[];
  @OneToMany(
    () => DataSectionDraftEntity,
    (dataSection) => dataSection.productDataModel,
    { cascade: ['insert', 'update'] },
  )
  sections: DataSectionDraftEntity[];

  @ManyToOne(() => UserEntity, (user) => user.createdProductModelDrafts)
  createdByUser: UserEntity;

  @Column()
  @RelationId((draft: ProductDataModelDraftEntity) => draft.createdByUser)
  createdByUserId: string;

  @ManyToOne(() => OrganizationEntity, (org) => org.productDataModelDrafts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  ownedByOrganization: OrganizationEntity;

  @Column()
  @RelationId((draft: ProductDataModelDraftEntity) => draft.ownedByOrganization)
  ownedByOrganizationId: string;
}
