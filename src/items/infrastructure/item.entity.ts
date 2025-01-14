import { Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { ProductEntity } from '../../products/infrastructure/product.entity';

@Entity('Item')
export class ItemEntity {
  @PrimaryColumn('uuid')
  id: string;
  @ManyToOne(() => ProductEntity, (product) => product.items)
  product: ProductEntity;
  @RelationId((item: ItemEntity) => item.product)
  productId: string;
}
