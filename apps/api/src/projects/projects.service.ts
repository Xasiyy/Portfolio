import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity'

@Injectable() //dit a nest que cette classe peut etre injectee ailleurs 
export class ProjectsService {
	constructor(
		@InjectRepository(Project)
		private readonly projectsRepository: Repository<Project>,
	) {}

	//trier les projet et les return dans lordre choisit
	findAll(): Promise<Project[]> {
		return this.projectsRepository.find({ order: { order: 'ASC' } });
	}

	//cherche un projet par son id et si typeorm ne trouve rien findOneBy renvoie null
	async findOne(id: string): Promise<Project> {
		const project = await this.projectsRepository.findOneBy({ id });
		if (!project) {
			throw new NotFoundException(`Project ${id} not found`);
		}
		return project;
	}
}