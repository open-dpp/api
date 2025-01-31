import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';
import { generateConfig } from './src/database/config';

config();

const configService = new ConfigService();

const AppDataSource = new DataSource({
  ...generateConfig(
    configService,
    path.join(__dirname, '/src/migrations/**/*{.ts,.js}'),
  ),
  entities: [path.join(__dirname, '/src/**/*.entity{.ts,.js}')],
  logging: true,
});

export default AppDataSource;
