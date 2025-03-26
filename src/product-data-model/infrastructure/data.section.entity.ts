import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { DataFieldEntity } from './data.field.entity';
import { ProductDataModelEntity } from './product.data.model.entity';

import { SectionType } from '../domain/section';

@Entity('data_section')
export class DataSectionEntity {
  @PrimaryColumn('uuid', { name: 'id' })
  id: string;
  @Column()
  name: string;
  @Column({
    type: 'text',
    enum: SectionType,
  })
  type: SectionType;
  @OneToMany(() => DataFieldEntity, (dataField) => dataField.section, {
    cascade: ['insert', 'update', 'remove'],
  })
  dataFields: DataFieldEntity[];
  @ManyToOne(
    () => ProductDataModelEntity,
    (productDataModel) => productDataModel.sections,
  )
  productDataModel: ProductDataModelEntity;
}
