import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Permalink {
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
  uuid: string;

  @Column()
  view: 'all' | 'manufacturer' | 'compliance' | 'client';

  @Column('uuid', {
    name: 'referencedId',
  })
  referencedId: string;
}
