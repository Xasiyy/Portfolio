import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Project {
    @PrimaryGeneratedColumn('uuid') //cle primaire de la table, id unique de chaque ligne
    id: string;

    @Column()
    title: string;

    @Column('text')
    description: string

    @Column({ nullable: true })
    imageUrl: string;

    @Column('simple-array', { nullable: true })
    techStack: string[];

    @Column({ nullable: true })
    repoUrl: string;

    @Column({ nullable: true })
    liveUrl: string;

    @Column({ default: false })
    featured: boolean;

    @Column({ default: 0 })
    order: number;

    @CreateDateColumn() //cree une colonne qui va enregistree date/heure au moment ou la ligne est cree
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}