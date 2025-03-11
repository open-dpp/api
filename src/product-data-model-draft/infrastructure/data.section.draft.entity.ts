import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { DataFieldDraftEntity } from './data.field.draft.entity';
import { ProductDataModelDraftEntity } from './product.data.model.draft.entity';
import { SectionType } from '../../product-data-model/domain/section';

@Entity('data_section_draft')
export class DataSectionDraftEntity {
  @PrimaryColumn('uuid', { name: 'id' })
  id: string;
  @Column()
  name: string;
  @Column({
    type: 'text',
    enum: SectionType,
  })
  type: SectionType;
  @OneToMany(() => DataFieldDraftEntity, (dataField) => dataField.section, {
    cascade: ['insert', 'update', 'remove'],
  })
  dataFields: DataFieldDraftEntity[];
  @ManyToOne(
    () => ProductDataModelDraftEntity,
    (productDataModel) => productDataModel.sections,
    { orphanedRowAction: 'delete' },
  )
  productDataModel: ProductDataModelDraftEntity;
}
