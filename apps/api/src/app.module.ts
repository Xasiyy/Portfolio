//module racine 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module';
import { ContactModule } from './contact/contact.module';
import { envValidationSchema } from './config/env.validation';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envValidationSchema,
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                url: process.env.DATABASE_URL,
                autoLoadEntities: true,
                migrations: [__dirname + '/migrations/*.js'],
                synchronize: process.env.NODE_ENV !== 'production',
            })
        }),
        ProjectsModule,
        ContactModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}