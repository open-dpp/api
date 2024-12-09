import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Organization} from "../../organizations/entities/organization.entity";

@Entity()
export class User {
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
    keycloakId: string;

    @Column()
    username: string;

    @ManyToMany(
        () => Organization,
        (organization) => organization.users,
        {onDelete: "CASCADE", onUpdate: "CASCADE"},
    )
    @JoinTable({
        name: "organization_user",
        joinColumns: [{name: "id", referencedColumnName: "id"}],
        inverseJoinColumns: [
            {name: "id", referencedColumnName: "id"},
        ],
    })
    organizations: Organization[];
}
