import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Permalink} from "../../permalinks/entities/permalink.entity";

@Entity()
export class Product {
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
    name: string;

    @Column()
    description: string;

    @OneToMany(() => Permalink, (permalink) => permalink.product)
    permalinks: Permalink[];
}
