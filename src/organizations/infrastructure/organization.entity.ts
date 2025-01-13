import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/user.entity';

@Entity('Organization')
export class OrganizationEntity {
  @PrimaryColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @Column()
  name: string;

  @ManyToMany(
    () => UserEntity,
    (preventionCourse) => preventionCourse.organizations,
    { cascade: ['insert'], onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  users: UserEntity[];
}
