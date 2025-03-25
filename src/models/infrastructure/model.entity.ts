import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ItemEntity } from '../../items/infrastructure/item.entity';
import { DataValueEntity } from './data.value.entity';
import { OrganizationEntity } from '../../organizations/infrastructure/organization.entity';

@Entity('model')
export class ModelEntity {
  @PrimaryColumn('uuid', { name: 'id' })
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('char', {
    name: 'createdByUserId',
  })
  @RelationId((model: ModelEntity) => model.createdByUser)
  createdByUserId: string;

  @ManyToOne(() => UserEntity, (user) => user.createdModels)
  createdByUser: UserEntity;

  @Column('char', {
    name: 'ownedByOrganizationId',
  })
  @RelationId((model: ModelEntity) => model.ownedByOrganization)
  ownedByOrganizationId: string;

  @ManyToOne(() => OrganizationEntity, (org) => org.models, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  ownedByOrganization: OrganizationEntity;

  @OneToMany(() => ItemEntity, (item) => item.model)
  items: ItemEntity[];

  @OneToMany(() => DataValueEntity, (dataValue) => dataValue.model, {
    cascade: ['insert', 'update'],
  })
  dataValues: DataValueEntity[];

  @Column('uuid', { nullable: true })
  productDataModelId: string;
}
