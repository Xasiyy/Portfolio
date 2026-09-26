//module racine 
import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module';
import { ContactModule } from './contact/contact.module';
import { envValidationSchema } from './config/env.validation';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SandboxModule } from './sandbox/sandbox.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envValidationSchema,
        }),
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                url: process.env.DATABASE_URL,
                autoLoadEntities: true,
                migrations: [__dirname + '/migrations/*.js'],
                synchronize: false,
                migrationsRun: true,
            })
        }),
        HealthModule,
        ProjectsModule,
        ContactModule,
        SandboxModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}