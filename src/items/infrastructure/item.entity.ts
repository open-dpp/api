import { Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { ProductEntity } from '../../products/infrastructure/product.entity';

@Entity('item')
export class ItemEntity {
  @PrimaryColumn('uuid')
  id: string;
  @ManyToOne(() => ProductEntity, (product) => product.items)
  model: ProductEntity;
  @RelationId((item: ItemEntity) => item.model)
  modelId: string;
}
