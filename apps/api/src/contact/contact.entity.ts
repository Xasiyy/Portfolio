import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Contact {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    message: string;

    @Column()
    email: string;

    @CreateDateColumn()
    createdAt: Date;
}