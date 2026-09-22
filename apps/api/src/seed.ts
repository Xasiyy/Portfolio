import { title } from "process";
import { AppDataSource } from "./data-source";
import { Project } from './projects/project.entity';

async function seed() {
    await AppDataSource.initialize();

    const projectRepository = AppDataSource.getRepository(Project);

    await projectRepository.clear();

    const projects = projectRepository.create([
        {
            title: 'Cub3D',
            description: "Création d'un petit jeu 3D pour comprendre et apprendre à maîtriser la perspective et le raycasting avec des formules mathématiques complexes. Ce projet a été fait en duo.",
            techStack: ['C'],
            repoUrl: 'https://github.com/Xasiyy/Cub3D.git',
            completedAt: ('2025-12'),
        },
        {
            title: 'Minishell',
            description: "Ce projet est l'un des plus complexes du cursus, il s'effectue en duo. Ce projet a pour but de reproduire quasiment à l'identique un shell avec toutes ses commandes fonctionnelles et sans aucune fuite de mémoire.",
            techStack: ['C'],
            repoUrl: 'https://github.com/Xasiyy/minishell.git',
            completedAt: ('2025-08'),
        },
        {
            title: 'transcendence',
            description: "Projet symbolique de l'école qui s'effectue en groupe. Ce projet est une application web dans laquelle on reproduit le jeu Skribbl.io, où des utilisateurs peuvent dessiner et deviner en temps réel à travers un chat, et des parties privées ou publiques.",

            techStack: ['Nestjs', 'Typescript', 'React', 'Docker'],
            repoUrl: 'https://github.com/wakhoo/42_transcendence.git',
            completedAt: ('2026-08'),
        },
        {
            title: 'Ftclock',
            description: "Site web interactif créé pour tous les étudiants de l'école 42. Ce projet a pour but d'aider les étudiants de l'école à calculer plus facilement les heures qu'ils ont à faire sur le campus, en fonction de leurs disponibilités, pour leur permettre d'avoir une meilleure organisation.",

            techStack: ['Javascript', 'HTML', 'CSS'],
            repoUrl: '',
            completedAt: ('2026-02'),
        },
        {
            title: 'push_swap',
            description: 'Algorithme de trie ',
            techStack: ['C'],
            completedAt: ('2024-11'),
        },
        {
            title: 'portfolio',
            description: 'Site web interactif dans lequel sera présenté mon parcours et mes projets vitrines, dont certains pourront être compilés et testés en temps réel grâce à une méthode de conteneurisation élaborée.',
            techStack: ['NestJs', 'Typescript', 'React', 'NextJs', 'Docker', 'PostgreSQL'],
            repoUrl: 'https://github.com/Xasiyy/Portfolio.git',
            completedAt: ('2026-10'),
        },
    ]);

    await projectRepository.save(projects);
    console.log(`${projects.length} projects created.`);

    await AppDataSource.destroy();
}

seed().catch((err) => {
    console.error('Error during seed: ', err);
    process.exit(1);
})