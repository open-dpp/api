import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';

config();

const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  migrations: [path.join(__dirname, '/src/migrations/**/*{.ts,.js}')],
  entities: [path.join(__dirname, '/src/**/*.entity{.ts,.js}')],
  synchronize: false,
  dropSchema: false,
  logging: true,
});

export default AppDataSource;
