import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ItemEntity } from '../../items/infrastructure/item.entity';
import { ProductDataModelEntity } from '../../product-data-model/infrastructure/product.data.model.entity';
import { DataValueEntity } from './data.value.entity';
import { DataValue } from '../domain/product';

@Entity('product')
export class ProductEntity {
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

  @Column()
  description: string;

  @Column('char', {
    name: 'createdByUserId',
  })
  createdByUserId: string;

  @ManyToOne(() => UserEntity, (user) => user.products, {
    cascade: ['insert'],
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'createdByUserId', referencedColumnName: 'id' }])
  createdByUser: UserEntity;

  // TODO: OneToMany instead of ManyToMany
  @ManyToMany(() => ItemEntity, (item) => item.model)
  items: ItemEntity[];

  @OneToMany(() => DataValueEntity, (dataValue) => dataValue.model, {
    cascade: ['insert', 'update'],
  })
  dataValues: DataValue[];

  @Column('uuid', { nullable: true })
  productDataModelId: string;
}
