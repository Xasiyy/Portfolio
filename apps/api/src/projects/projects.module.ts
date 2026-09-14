import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { SandboxModule } from '../sandbox/sandbox.module';

@Module({
    imports: [TypeOrmModule.forFeature([Project]), SandboxModule], //outil pour .find() .save() .delete()
    controllers: [ProjectsController],
    providers: [ProjectsService],
    exports: [TypeOrmModule],
})
export class ProjectsModule {}