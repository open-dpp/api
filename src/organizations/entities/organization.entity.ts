import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {User} from "../../users/entities/user.entity";

@Entity()
export class Organization {
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

    @ManyToMany(
        () => User,
        (preventionCourse) => preventionCourse.organizations,
        {onDelete: "CASCADE", onUpdate: "CASCADE"},
    )
    users: User[];
}
