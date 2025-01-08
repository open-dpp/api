import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('permalink')
export class PermalinkEntity {
  @PrimaryColumn()
  uuid: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @Column()
  view: 'all' | 'manufacturer' | 'compliance' | 'client';

  @Column('uuid', {
    name: 'referencedId',
  })
  referencedId: string;
}
