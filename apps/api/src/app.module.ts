//module racine 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module';
import { ContactModule } from './contact/contact.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            autoLoadEntities: true,
            synchronize: process.env.NODE_ENV !== 'production',
        }),
        ProjectsModule,
        ContactModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}