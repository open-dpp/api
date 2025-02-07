import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('data_value')
export class DataValueEntity {
  @PrimaryColumn('uuid', { name: 'id' })
  id: string;
  @Column('jsonb', { nullable: true })
  value: unknown;
  @Column('uuid')
  dataSectionId: string;
  @Column('uuid')
  dataFieldId: string;

  @ManyToOne(() => ProductEntity, (product) => product.dataValues)
  model: ProductEntity;
}
