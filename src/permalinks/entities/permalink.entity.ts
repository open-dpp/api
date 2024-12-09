import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Product} from "../../products/entities/product.entity";

@Entity()
export class Permalink {
    @Column("char", {
        primary: true,
        name: "id",
        length: 36,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({nullable: true})
    deletedAt: Date | null;

    @Column()
    uuid: string;

    @Column()
    view: 'all' | 'manufacturer' | 'compliance' | 'client';

    @Column("char", {
        name: "productId",
    })
    productId: string;

    @ManyToOne(() => Product, (product) => product.permalinks, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "productId", referencedColumnName: "id"}])
    product: Product;
}
