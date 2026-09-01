import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Project } from './projects/project.entity';
import { Contact } from './contact/contact.entity';

export const AppDataSource = new DataSource({
	type: 'postgres',
	url: process.env.DATABASE_URL,
	entities: [Project, Contact],
	migrations: ['src/migrations/*.ts'],
	synchronize: false,
});