import { DataSource } from 'typeorm';
import { Order } from './orders/order.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DB_PATH || 'database.sqlite',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: [Order],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
}); 