import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
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
  createdByUserId: string;

  @ManyToOne(() => UserEntity, (user) => user.createdModels, {
    cascade: ['insert'],
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'createdByUserId', referencedColumnName: 'id' }])
  createdByUser: UserEntity;

  @Column('char', {
    name: 'ownedByOrganizationId',
  })
  ownedByOrganizationId: string;

  @ManyToOne(() => OrganizationEntity, (org) => org.models, {
    cascade: ['insert'],
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'ownedByOrganizationId', referencedColumnName: 'id' }])
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
