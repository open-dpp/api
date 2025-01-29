import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        synchronize: false,
        autoLoadEntities: true,
        dropSchema: false,
        migrationsTransactionMode: 'each',
        entities: [path.join(__dirname, '../src/**/*.entity{.ts,.js}')],
        migrationsRun: true,
        migrations: [path.join(__dirname, '../src/migrations/**/*{.ts,.js}')],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class TypeOrmTestingModule {}
