import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { DataSectionDraftEntity } from './data.section.draft.entity';
import { DataFieldType } from '../../product-data-model/domain/data.field';

@Entity('data_field_draft')
export class DataFieldDraftEntity {
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
  @ManyToOne(
    () => DataSectionDraftEntity,
    (dataSection) => dataSection.dataFields,
    { orphanedRowAction: 'delete', onDelete: 'CASCADE' },
  )
  section: DataSectionDraftEntity;
}
