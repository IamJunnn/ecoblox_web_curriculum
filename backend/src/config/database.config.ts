import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: process.env.DATABASE_PATH || join(__dirname, '../../../backend', 'database.db'),
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: false, // Use existing database schema
  logging: process.env.NODE_ENV === 'development',
};