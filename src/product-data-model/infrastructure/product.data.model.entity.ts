import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { DataSectionEntity } from './data.section.entity';

@Entity('product_data_model')
export class ProductDataModelEntity {
  @PrimaryColumn('uuid', { name: 'id' })
  id: string;
  @OneToMany(
    () => DataSectionEntity,
    (dataSection) => dataSection.productDataModel,
    { cascade: ['insert', 'update'] },
  )
  sections: DataSectionEntity[];
}
