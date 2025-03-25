import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  RelationId,
} from 'typeorm';
import { DataSectionEntity } from './data.section.entity';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { OrganizationEntity } from '../../organizations/infrastructure/organization.entity';
import { VisibilityLevel } from '../domain/product.data.model';

@Entity('product_data_model')
export class ProductDataModelEntity {
  @PrimaryColumn('uuid', { name: 'id' })
  id: string;
  @Column()
  name: string;
  @Column()
  version: string;
  @Column({
    type: 'text',
    enum: VisibilityLevel,
  })
  visibility: VisibilityLevel;

  @OneToMany(
    () => DataSectionEntity,
    (dataSection) => dataSection.productDataModel,
    { cascade: ['insert', 'update'] },
  )
  sections: DataSectionEntity[];
  @ManyToOne(() => UserEntity, (user) => user.createdProductModels)
  createdByUser: UserEntity;

  @Column({ nullable: true })
  @RelationId((dataModel: ProductDataModelEntity) => dataModel.createdByUser)
  createdByUserId: string;

  @ManyToOne(() => OrganizationEntity, (org) => org.productDataModels, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  ownedByOrganization: OrganizationEntity;

  @Column({ nullable: true })
  @RelationId(
    (dataModel: ProductDataModelEntity) => dataModel.ownedByOrganization,
  )
  ownedByOrganizationId: string;
}
