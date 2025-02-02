import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ItemEntity } from '../../items/infrastructure/item.entity';

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

  @ManyToMany(() => ItemEntity, (item) => item.model)
  items: ItemEntity[];
}
