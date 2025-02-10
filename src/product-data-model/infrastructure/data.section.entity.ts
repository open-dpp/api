import { Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { DataFieldEntity } from './data.field.entity';
import { ProductDataModelEntity } from './product.data.model.entity';

@Entity('data_section')
export class DataSectionEntity {
  @PrimaryColumn('uuid', { name: 'id' })
  id: string;
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
