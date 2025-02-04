import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { DataSectionEntity } from './data.section.entity';
import { DataType } from '../domain/product.data.model';

@Entity('data_field')
export class DataFieldEntity {
  @PrimaryColumn('uuid', { name: 'id' })
  id: string;
  @Column()
  name: string;
  @Column({
    type: 'enum',
    enum: DataType,
  })
  type: DataType;
  @Column({ type: 'jsonb' })
  value: unknown;
  @ManyToOne(() => DataSectionEntity, (dataSection) => dataSection.dataFields)
  section: DataSectionEntity;
}
