import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { DataSectionEntity } from './data.section.entity';

import { DataFieldType } from '../domain/data.field';

@Entity('data_field')
export class DataFieldEntity {
  @PrimaryColumn('uuid', { name: 'id' })
  id: string;
  @Column()
  name: string;
  @Column({
    type: 'text',
    enum: DataFieldType,
  })
  type: DataFieldType;
  @Column({ type: 'jsonb' })
  options: Record<string, unknown>;
  @ManyToOne(() => DataSectionEntity, (dataSection) => dataSection.dataFields)
  section: DataSectionEntity;
}
