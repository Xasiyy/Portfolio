import { Controller, Get, Param, ParseUUIDPipe, BadRequestException, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { SandboxService } from '../sandbox/sandbox.service';

@Controller('projects')
export class ProjectsController {
	constructor(
		private readonly projectsService: ProjectsService,
		private readonly sandboxService: SandboxService,
	) {}

	@Get()
	findAll() {
		return this.projectsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id', ParseUUIDPipe) id: string) {
		return this.projectsService.findOne(id);
	}

	@Post(':id/sandbox')
	async createSandbox(@Param('id', ParseUUIDPipe) id: string) {
		const project = await this.projectsService.findOne(id);
		
		if (!project.repoUrl) {
			throw new BadRequestException(`Project ${id} has no repoUrl`);
		}

		return this.sandboxService.createSandbox(project.repoUrl);
	}
}