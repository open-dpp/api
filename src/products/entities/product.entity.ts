import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('product')
export class ProductEntity {
  @Column('char', {
    primary: true,
    name: 'id',
    length: 36,
  })
  @PrimaryGeneratedColumn('uuid')
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

  @ManyToOne(() => User, (user) => user.products, {
    cascade: ['insert'],
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'createdByUserId', referencedColumnName: 'id' }])
  createdByUser: User;
}
