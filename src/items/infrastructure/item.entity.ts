import { Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { ModelEntity } from '../../models/infrastructure/model.entity';

@Entity('item')
export class ItemEntity {
  @PrimaryColumn('uuid')
  id: string;
  @ManyToOne(() => ModelEntity, (product) => product.items)
  model: ModelEntity;
  @RelationId((item: ItemEntity) => item.model)
  modelId: string;
}
