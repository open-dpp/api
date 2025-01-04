import { TypeOrmModule } from '@nestjs/typeorm';

export const TypeOrmTestingModule = (entities: any) =>
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 20003,
    username: 'open-dpp',
    password: 'open-dpp',
    database: 'open-dpp',
    synchronize: true,
    autoLoadEntities: true,
    dropSchema: false,
    entities: [...entities],
  });
