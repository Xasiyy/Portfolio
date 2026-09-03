import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
	constructor(private readonly projectsService: ProjectsService) {}

	@Get()
	findAll() {
		return this.projectsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id', ParseUUIDPipe) id: string) {
		return this.projectsService.findOne(id);
	}
}